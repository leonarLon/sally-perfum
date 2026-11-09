-- Sally Perfumaria — cupons de desconto.
--
-- * Os códigos NÃO são legíveis pela API pública: só o admin lê a tabela. A validação de um
--   código acontece em funções restritas ao service role, chamadas por server actions com
--   limite de tentativas (ninguém testa códigos em massa com a chave pública).
-- * O desconto incide sobre os produtos (nunca sobre o frete) e é calculado SEMPRE aqui.
--   O frete grátis é avaliado sobre o valor dos produtos já com desconto.
-- * O pedido fica com pelo menos R$ 1,00 em produtos (o desconto nunca zera a cobrança).
-- * Usos = pedidos com o cupom que não foram cancelados nem expiraram. create_order trava a
--   linha do cupom, então o limite não estoura com pedidos simultâneos.

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null check (code ~ '^[A-Z0-9][A-Z0-9-]{2,31}$'),
  description text check (length(description) <= 200),
  kind text not null check (kind in ('percent', 'fixed')),
  percent_off int check (percent_off between 1 and 90),
  amount_off_cents int check (amount_off_cents > 0),
  max_discount_cents int check (max_discount_cents > 0),
  min_subtotal_cents int not null default 0 check (min_subtotal_cents >= 0),
  starts_at timestamptz,
  ends_at timestamptz,
  max_uses int check (max_uses > 0),
  once_per_email boolean not null default false,
  is_active boolean not null default true,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind = 'percent' and percent_off is not null and amount_off_cents is null)
      or (kind = 'fixed' and amount_off_cents is not null and percent_off is null and max_discount_cents is null)),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create unique index coupons_code_key on public.coupons (code);

create trigger coupons_updated_at before update on public.coupons
  for each row execute function public.set_updated_at();
create trigger audit_coupons after insert or update or delete on public.coupons
  for each row execute function public.audit_row_change('id');

alter table public.coupons enable row level security;
create policy "admin gerencia cupons" on public.coupons
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
revoke all on public.coupons from anon;
revoke delete, truncate on public.coupons from authenticated; -- cupom não se apaga: desativa

alter table public.orders
  add column coupon_id uuid references public.coupons (id) on delete set null,
  add column coupon_code text;
create index orders_coupon_idx on public.orders (coupon_id, status) where coupon_id is not null;
grant select (coupon_code) on public.orders to authenticated;

-- Cupom de demonstração (ver PENDENCIAS_COMERCIAIS.md §4).
insert into public.coupons (code, description, kind, percent_off, max_discount_cents, min_subtotal_cents)
values ('BEMVINDA10', 'Demonstração: 10% de desconto em compras a partir de R$ 150,00 (máx. R$ 100,00)', 'percent', 10, 10000, 15000);

-- ---------------------------------------------------------------------------
-- Avaliação (interna): devolve o desconto ou o motivo da recusa
-- ---------------------------------------------------------------------------
-- erros: CUPOM_INVALIDO, CUPOM_NAO_INICIADO, CUPOM_EXPIRADO, CUPOM_ESGOTADO,
--        CUPOM_MINIMO:<centavos>, CUPOM_JA_USADO
create or replace function public.evaluate_coupon(p_code text, p_subtotal_cents int, p_email text default null, p_lock boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.coupons%rowtype;
  v_code text := upper(trim(coalesce(p_code, '')));
  used int;
  raw int;
  discount int;
begin
  if v_code !~ '^[A-Z0-9][A-Z0-9-]{2,31}$' then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_INVALIDO');
  end if;
  if p_lock then
    select * into c from public.coupons where code = v_code for update;
  else
    select * into c from public.coupons where code = v_code;
  end if;
  if not found or not c.is_active then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_INVALIDO');
  end if;
  if c.starts_at is not null and now() < c.starts_at then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_NAO_INICIADO');
  end if;
  if c.ends_at is not null and now() >= c.ends_at then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_EXPIRADO');
  end if;
  if c.max_uses is not null then
    select count(*) into used from public.orders
     where coupon_id = c.id and status not in ('canceled', 'expired');
    if used >= c.max_uses then
      return jsonb_build_object('ok', false, 'error', 'CUPOM_ESGOTADO');
    end if;
  end if;
  if coalesce(p_subtotal_cents, 0) < c.min_subtotal_cents then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_MINIMO:' || c.min_subtotal_cents, 'code', c.code);
  end if;
  if c.once_per_email and p_email is not null and exists (
       select 1 from public.orders where coupon_id = c.id and customer_email = lower(trim(p_email))
          and status not in ('canceled', 'expired')) then
    return jsonb_build_object('ok', false, 'error', 'CUPOM_JA_USADO');
  end if;

  raw := case c.kind
           when 'percent' then least((p_subtotal_cents::bigint * c.percent_off / 100)::int, coalesce(c.max_discount_cents, 2147483647))
           else c.amount_off_cents end;
  discount := greatest(least(raw, p_subtotal_cents - 100), 0);
  return jsonb_build_object('ok', true, 'coupon_id', c.id, 'code', c.code, 'description', c.description,
                            'discount_cents', discount);
end;
$$;

revoke all on function public.evaluate_coupon(text, int, text, boolean) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Cotação com cupom (somente service role)
-- ---------------------------------------------------------------------------
create or replace function public.quote_cart_coupon(p_items jsonb, p_cep text, p_coupon text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  q jsonb := public.quote_cart(p_items, null);
  subtotal int := (q ->> 'subtotal_cents')::int;
  ev jsonb;
  discount int := 0;
begin
  if subtotal > 0 and nullif(trim(coalesce(p_coupon, '')), '') is not null then
    ev := public.evaluate_coupon(p_coupon, subtotal);
    if (ev ->> 'ok')::boolean then
      discount := (ev ->> 'discount_cents')::int;
    end if;
  end if;
  return q || jsonb_build_object(
    'coupon', ev,
    'discount_cents', discount,
    'shipping', case when p_cep is null then null else public.shipping_quote(p_cep, subtotal - discount) end
  );
end;
$$;

revoke all on function public.quote_cart_coupon(jsonb, text, text) from public, anon, authenticated;
grant execute on function public.quote_cart_coupon(jsonb, text, text) to service_role;

-- ---------------------------------------------------------------------------
-- create_order com cupom (substitui a versão de 7 parâmetros)
-- ---------------------------------------------------------------------------
drop function public.create_order(uuid, uuid, jsonb, jsonb, jsonb, text, boolean);

create or replace function public.create_order(
  p_idempotency_key uuid,
  p_user_id uuid,
  p_items jsonb,
  p_customer jsonb,
  p_address jsonb,
  p_payment_method text,
  p_privacy_accepted boolean,
  p_coupon_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  s public.store_settings%rowtype;
  existing public.orders%rowtype;
  new_order public.orders%rowtype;
  it record;
  subtotal int := 0;
  discount int := 0;
  ev jsonb;
  ship jsonb;
  n_lines int;
  cep text := regexp_replace(coalesce(p_address ->> 'cep', ''), '\D', '', 'g');
begin
  if p_idempotency_key is null then
    raise exception 'chave de idempotência obrigatória' using errcode = '22023';
  end if;

  -- Requisições com a mesma chave são serializadas; a repetição devolve o mesmo pedido.
  perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key::text, 0));
  select * into existing from public.orders where idempotency_key = p_idempotency_key;
  if found then
    return jsonb_build_object('order_id', existing.id, 'number', existing.number, 'token', existing.public_token,
                              'total_cents', existing.total_cents, 'replayed', true);
  end if;

  if p_privacy_accepted is distinct from true then
    raise exception 'é preciso aceitar a política de privacidade' using errcode = '22023';
  end if;
  if p_payment_method is null or p_payment_method not in ('pix', 'card', 'boleto') then
    raise exception 'forma de pagamento inválida' using errcode = '22023';
  end if;

  select * into s from public.store_settings;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'sacola vazia' using errcode = '22023';
  end if;

  perform public.release_expired_reservations();

  -- Todo item precisa ser {variant_id: uuid, quantity: inteiro}; nada é descartado em silêncio.
  if exists (select 1 from jsonb_array_elements(p_items) e
              where jsonb_typeof(e) <> 'object'
                 or coalesce(e ->> 'variant_id', '') !~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
                 or coalesce(e ->> 'quantity', '') !~ '^[0-9]{1,3}$') then
    raise exception 'sacola inválida' using errcode = '22023';
  end if;

  create temporary table if not exists pg_temp.req_items (variant_id uuid primary key, quantity int not null) on commit drop;
  truncate pg_temp.req_items;
  insert into pg_temp.req_items (variant_id, quantity)
  select (e ->> 'variant_id')::uuid, sum((e ->> 'quantity')::int)
    from jsonb_array_elements(p_items) e
   where (e ->> 'variant_id') ~ '^[0-9a-fA-F-]{36}$' and (e ->> 'quantity') ~ '^[0-9]{1,3}$'
   group by 1;

  select count(*) into n_lines from pg_temp.req_items;
  if n_lines > s.max_items_per_order then
    raise exception 'máximo de % itens diferentes por pedido', s.max_items_per_order using errcode = '22023';
  end if;
  if exists (select 1 from pg_temp.req_items where quantity < 1 or quantity > s.max_qty_per_item) then
    raise exception 'quantidade por item deve ser de 1 a %', s.max_qty_per_item using errcode = '22023';
  end if;

  -- Trava o estoque das variantes pedidas em ordem fixa (evita deadlock entre pedidos).
  perform 1 from public.inventory i where i.variant_id in (select variant_id from pg_temp.req_items)
   order by i.variant_id for update;

  for it in
    select r.variant_id, r.quantity, v.sku, v.price_cents, v.volume_ml, p.name, p.slug, b.name as brand_name,
           (v.is_active and p.status = 'published' and b.is_active) as sellable,
           coalesce(i.on_hand - i.reserved, 0) as available
      from pg_temp.req_items r
      left join public.product_variants v on v.id = r.variant_id
      left join public.products p on p.id = v.product_id
      left join public.brands b on b.id = p.brand_id
      left join public.inventory i on i.variant_id = r.variant_id
  loop
    if it.sku is null or not it.sellable then
      raise exception 'ITEM_INDISPONIVEL:%', coalesce(it.sku, it.variant_id::text) using errcode = 'P0001';
    end if;
    if it.available < it.quantity then
      raise exception 'ESTOQUE_INSUFICIENTE:%:%', it.sku, greatest(it.available, 0) using errcode = 'P0001';
    end if;
    subtotal := subtotal + it.price_cents * it.quantity;
  end loop;

  -- Cupom: revalidado aqui com a linha travada (o limite de usos vale com pedidos simultâneos).
  if nullif(trim(coalesce(p_coupon_code, '')), '') is not null then
    ev := public.evaluate_coupon(p_coupon_code, subtotal, p_customer ->> 'email', true);
    if not (ev ->> 'ok')::boolean then
      raise exception '%', ev ->> 'error' using errcode = 'P0001';
    end if;
    discount := (ev ->> 'discount_cents')::int;
  end if;

  ship := public.shipping_quote(cep, subtotal - discount);
  if ship is null then
    raise exception 'CEP inválido' using errcode = '22023';
  end if;

  insert into public.orders (
    user_id, idempotency_key, customer_name, customer_email, customer_phone,
    ship_cep, ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state,
    shipping_label, shipping_days_min, shipping_days_max, payment_method,
    subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_id, coupon_code,
    reserved_until, privacy_accepted_at)
  values (
    p_user_id, p_idempotency_key, trim(p_customer ->> 'name'), lower(trim(p_customer ->> 'email')),
    nullif(regexp_replace(coalesce(p_customer ->> 'phone', ''), '\D', '', 'g'), ''),
    cep, trim(p_address ->> 'street'), trim(p_address ->> 'number'), nullif(trim(coalesce(p_address ->> 'complement', '')), ''),
    trim(p_address ->> 'district'), trim(p_address ->> 'city'), upper(trim(p_address ->> 'state')),
    ship ->> 'label', (ship ->> 'days_min')::int, (ship ->> 'days_max')::int, p_payment_method,
    subtotal, (ship ->> 'price_cents')::int, discount, subtotal + (ship ->> 'price_cents')::int - discount,
    (ev ->> 'coupon_id')::uuid, ev ->> 'code',
    now() + make_interval(mins => s.reservation_minutes), now())
  returning * into new_order;

  insert into public.order_items (order_id, variant_id, sku, product_name, brand_name, product_slug, volume_ml,
                                  unit_price_cents, quantity, line_total_cents)
  select new_order.id, r.variant_id, v.sku, p.name, b.name, p.slug, v.volume_ml, v.price_cents, r.quantity, v.price_cents * r.quantity
    from pg_temp.req_items r
    join public.product_variants v on v.id = r.variant_id
    join public.products p on p.id = v.product_id
    join public.brands b on b.id = p.brand_id;

  update public.inventory i set reserved = i.reserved + r.quantity
    from pg_temp.req_items r where i.variant_id = r.variant_id;

  insert into public.inventory_movements (variant_id, type, quantity, reason, actor_id, order_id)
  select r.variant_id, 'reserve', -r.quantity, 'Reserva do pedido #' || new_order.number, p_user_id, new_order.id
    from pg_temp.req_items r;

  insert into public.order_events (order_id, from_status, to_status, note, actor_id)
  values (new_order.id, null, 'pending_payment',
          'Pedido criado; estoque reservado até o pagamento' || coalesce('; cupom ' || new_order.coupon_code, ''), p_user_id);

  return jsonb_build_object('order_id', new_order.id, 'number', new_order.number, 'token', new_order.public_token,
                            'total_cents', new_order.total_cents, 'replayed', false);
end;
$$;

revoke all on function public.create_order(uuid, uuid, jsonb, jsonb, jsonb, text, boolean, text) from public, anon, authenticated;
grant execute on function public.create_order(uuid, uuid, jsonb, jsonb, jsonb, text, boolean, text) to service_role;

-- ---------------------------------------------------------------------------
-- Painel: cupons com o número de usos
-- ---------------------------------------------------------------------------
create or replace function public.admin_list_coupons()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.has_role('admin') then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
  return (select coalesce(jsonb_agg(to_jsonb(c) || jsonb_build_object(
            'uses', (select count(*) from public.orders o where o.coupon_id = c.id and o.status not in ('canceled', 'expired')),
            'discount_given_cents', (select coalesce(sum(o.discount_cents), 0) from public.orders o
                                      where o.coupon_id = c.id and o.status in ('paid', 'shipped', 'delivered')))
          order by c.is_active desc, c.created_at desc), '[]'::jsonb)
    from public.coupons c);
end;
$$;

revoke all on function public.admin_list_coupons() from public, anon;
grant execute on function public.admin_list_coupons() to authenticated;

-- ---------------------------------------------------------------------------
-- Link do pedido: inclui o código do cupom
-- ---------------------------------------------------------------------------
create or replace function public.get_order_public(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
begin
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return null;
  end if;
  select * into o from public.orders where public_token = p_token;
  if not found then
    return null;
  end if;
  return jsonb_build_object(
    'number', o.number,
    'status', case when o.status = 'pending_payment' and o.reserved_until < now() then 'expired' else o.status end,
    'created_at', o.created_at,
    'reserved_until', o.reserved_until,
    'customer_name', o.customer_name,
    'customer_email', o.customer_email,
    'ship_city', o.ship_city, 'ship_state', o.ship_state,
    'ship_cep_masked', left(o.ship_cep, 3) || '**-***',
    'shipping_label', o.shipping_label, 'shipping_days_min', o.shipping_days_min, 'shipping_days_max', o.shipping_days_max,
    'payment_method', o.payment_method,
    'subtotal_cents', o.subtotal_cents, 'shipping_cents', o.shipping_cents,
    'discount_cents', o.discount_cents, 'coupon_code', o.coupon_code, 'total_cents', o.total_cents,
    'is_demo', o.is_demo,
    'payment', (select jsonb_build_object(
                  'method', p.method, 'status', p.status, 'amount_cents', p.amount_cents,
                  'pix_code', case when p.status = 'pending' then p.pix_code end,
                  'boleto_line', case when p.status = 'pending' then p.boleto_line end,
                  'card_brand', p.card_brand, 'card_last4', p.card_last4,
                  'failure_reason', p.failure_reason, 'expires_at', p.expires_at, 'created_at', p.created_at)
                from public.payments p where p.order_id = o.id order by p.created_at desc limit 1),
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
                'sku', oi.sku, 'product_name', oi.product_name, 'brand_name', oi.brand_name, 'product_slug', oi.product_slug,
                'volume_ml', oi.volume_ml, 'unit_price_cents', oi.unit_price_cents, 'quantity', oi.quantity,
                'line_total_cents', oi.line_total_cents) order by oi.id), '[]'::jsonb)
              from public.order_items oi where oi.order_id = o.id),
    'events', (select coalesce(jsonb_agg(jsonb_build_object('status', e.to_status, 'at', e.created_at) order by e.id), '[]'::jsonb)
               from public.order_events e where e.order_id = o.id)
  );
end;
$$;
