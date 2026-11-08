-- Sally Perfumaria — Fase 6: sacola, checkout, pedidos e reserva de estoque.
--
-- Regras:
-- * Preço, disponibilidade e frete são SEMPRE calculados aqui, nunca aceitos do navegador.
-- * create_order roda só com service role (chamado pela server action, que valida a sessão,
--   limita tentativas e passa o user_id verificado). Trava as linhas de estoque em ordem
--   fixa (sem deadlock), nunca reserva além do disponível e é idempotente por chave.
-- * Reserva expira (store_settings.reservation_minutes); a liberação é feita de forma
--   preguiçosa no início de cada pedido e de cada mudança de status (sem depender de cron).
-- * Movimentações: reserve = -q e release = +q (efeito no disponível); sale = -q e
--   return = +q (efeito no estoque físico).

-- ---------------------------------------------------------------------------
-- Frete (tabela fixa por região, D7) e configurações da loja
-- ---------------------------------------------------------------------------
create table public.shipping_zones (
  cep_prefix text primary key check (cep_prefix ~ '^[0-9]$'), -- 1º dígito do CEP
  label text not null,
  price_cents int not null check (price_cents >= 0),
  days_min int not null check (days_min > 0),
  days_max int not null check (days_max >= days_min),
  is_demo boolean not null default true
);

create table public.store_settings (
  id boolean primary key default true check (id),
  free_shipping_over_cents int check (free_shipping_over_cents is null or free_shipping_over_cents > 0),
  reservation_minutes int not null default 30 check (reservation_minutes between 5 and 1440),
  max_qty_per_item int not null default 10 check (max_qty_per_item between 1 and 100),
  max_items_per_order int not null default 20 check (max_items_per_order between 1 and 100),
  is_demo boolean not null default true
);

insert into public.store_settings (free_shipping_over_cents) values (29900);

-- Valores FICTÍCIOS de demonstração (ver PENDENCIAS_COMERCIAIS.md §4).
insert into public.shipping_zones (cep_prefix, label, price_cents, days_min, days_max) values
  ('0', 'São Paulo (capital e região)', 1990, 2, 4),
  ('1', 'São Paulo (interior e litoral)', 2290, 2, 5),
  ('2', 'Rio de Janeiro e Espírito Santo', 2490, 3, 6),
  ('3', 'Minas Gerais', 2490, 3, 6),
  ('4', 'Bahia e Sergipe', 3490, 5, 9),
  ('5', 'Pernambuco, Alagoas, Paraíba e Rio Grande do Norte', 3990, 6, 10),
  ('6', 'Norte, Ceará, Piauí e Maranhão', 4490, 7, 12),
  ('7', 'Centro-Oeste, Tocantins e Rondônia', 3490, 5, 9),
  ('8', 'Paraná e Santa Catarina', 2790, 4, 7),
  ('9', 'Rio Grande do Sul', 2990, 4, 8);

alter table public.shipping_zones enable row level security;
alter table public.store_settings enable row level security;
create policy "frete é público" on public.shipping_zones for select to anon, authenticated using (true);
create policy "configurações são públicas" on public.store_settings for select to anon, authenticated using (true);
create policy "admin gerencia frete" on public.shipping_zones
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "admin gerencia configurações" on public.store_settings
  for update to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));

create trigger audit_shipping_zones after insert or update or delete on public.shipping_zones
  for each row execute function public.audit_row_change('cep_prefix');

-- Frete para um CEP e subtotal. null se o CEP for inválido.
create or replace function public.shipping_quote(p_cep text, p_subtotal_cents int)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select case when z.cep_prefix is null then null else jsonb_build_object(
    'label', z.label,
    'days_min', z.days_min,
    'days_max', z.days_max,
    'free', s.free_shipping_over_cents is not null and p_subtotal_cents >= s.free_shipping_over_cents,
    'price_cents', case when s.free_shipping_over_cents is not null and p_subtotal_cents >= s.free_shipping_over_cents
                        then 0 else z.price_cents end,
    'free_over_cents', s.free_shipping_over_cents
  ) end
  from public.store_settings s
  left join public.shipping_zones z on z.cep_prefix = left(regexp_replace(coalesce(p_cep, ''), '\D', '', 'g'), 1)
                                   and length(regexp_replace(coalesce(p_cep, ''), '\D', '', 'g')) = 8
$$;

grant execute on function public.shipping_quote(text, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Pedidos
-- ---------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint not null unique default nextval('public.order_number_seq'),
  -- Capacidade de acesso do cliente sem cadastro (link do pedido): 244 bits aleatórios.
  public_token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  user_id uuid references auth.users (id) on delete set null,
  idempotency_key uuid not null unique,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'paid', 'shipped', 'delivered', 'canceled', 'expired')),
  customer_name text not null check (length(customer_name) between 2 and 120),
  customer_email text not null check (length(customer_email) <= 254 and customer_email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  customer_phone text check (customer_phone ~ '^[0-9]{10,11}$'),
  ship_cep text not null check (ship_cep ~ '^[0-9]{8}$'),
  ship_street text not null check (length(ship_street) between 2 and 160),
  ship_number text not null check (length(ship_number) between 1 and 20),
  ship_complement text check (length(ship_complement) <= 80),
  ship_district text not null check (length(ship_district) between 2 and 80),
  ship_city text not null check (length(ship_city) between 2 and 80),
  ship_state text not null check (ship_state in ('AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO')),
  shipping_label text not null,
  shipping_days_min int not null,
  shipping_days_max int not null,
  payment_method text not null check (payment_method in ('pix', 'card', 'boleto')),
  subtotal_cents int not null check (subtotal_cents > 0),
  shipping_cents int not null check (shipping_cents >= 0),
  discount_cents int not null default 0 check (discount_cents >= 0),
  total_cents int not null check (total_cents >= 0),
  reserved_until timestamptz,
  privacy_accepted_at timestamptz not null,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (total_cents = subtotal_cents + shipping_cents - discount_cents)
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);
create index orders_expiring_idx on public.orders (reserved_until) where status = 'pending_payment';

create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

-- Itens guardam um retrato do produto no momento da compra (nome, SKU, preço).
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  sku text not null,
  product_name text not null,
  brand_name text not null,
  product_slug text not null,
  volume_ml int,
  unit_price_cents int not null check (unit_price_cents > 0),
  quantity int not null check (quantity between 1 and 100),
  line_total_cents int not null,
  check (line_total_cents = unit_price_cents * quantity)
);

create index order_items_order_idx on public.order_items (order_id);

create table public.order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status text,
  to_status text not null,
  note text,
  actor_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index order_events_order_idx on public.order_events (order_id, id);

alter table public.inventory_movements add column order_id uuid references public.orders (id) on delete set null;
create index inventory_movements_order_idx on public.inventory_movements (order_id) where order_id is not null;

-- RLS: cliente lê os próprios pedidos; admin lê todos. Ninguém escreve direto pela API.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_events enable row level security;

create policy "cliente lê os próprios pedidos; admin lê todos" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or public.has_role('admin'));
create policy "itens dos pedidos visíveis" on public.order_items
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.has_role('admin'))));
create policy "histórico dos pedidos visível" on public.order_events
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.has_role('admin'))));

revoke all on public.orders, public.order_items, public.order_events from anon;
revoke insert, update, delete, truncate on public.orders, public.order_items, public.order_events from authenticated;
-- O token e a chave de idempotência não são lidos pelo cliente pela API.
revoke select on public.orders from authenticated;
grant select (id, number, user_id, status, customer_name, customer_email, customer_phone, ship_cep, ship_street,
  ship_number, ship_complement, ship_district, ship_city, ship_state, shipping_label, shipping_days_min,
  shipping_days_max, payment_method, subtotal_cents, shipping_cents, discount_cents, total_cents, reserved_until,
  is_demo, created_at, updated_at) on public.orders to authenticated;
revoke all on sequence public.order_number_seq from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Funções internas (sem execução para anon/authenticated)
-- ---------------------------------------------------------------------------

-- Aplica uma transição de status com o efeito no estoque. Chamar com a linha do pedido travada.
create or replace function public.apply_order_transition(p_order_id uuid, p_to text, p_note text, p_actor uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
  it record;
  allowed boolean;
begin
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'pedido inexistente' using errcode = 'P0002';
  end if;

  allowed := (o.status, p_to) in (
    ('pending_payment', 'paid'), ('pending_payment', 'canceled'), ('pending_payment', 'expired'),
    ('paid', 'shipped'), ('paid', 'canceled'), ('shipped', 'delivered'));
  if not allowed then
    raise exception 'transição inválida: % → %', o.status, p_to using errcode = '22023';
  end if;

  -- Estoque das variantes do pedido, travado sempre na mesma ordem.
  perform 1 from public.inventory i
   where i.variant_id in (select oi.variant_id from public.order_items oi where oi.order_id = o.id)
   order by i.variant_id for update;

  for it in select oi.variant_id, oi.quantity from public.order_items oi where oi.order_id = o.id and oi.variant_id is not null loop
    if o.status = 'pending_payment' and p_to = 'paid' then
      update public.inventory set reserved = reserved - it.quantity, on_hand = on_hand - it.quantity where variant_id = it.variant_id;
      insert into public.inventory_movements (variant_id, type, quantity, reason, actor_id, order_id)
      values (it.variant_id, 'sale', -it.quantity, 'Venda do pedido #' || o.number, p_actor, o.id);
    elsif o.status = 'pending_payment' then -- canceled / expired: devolve a reserva
      update public.inventory set reserved = greatest(reserved - it.quantity, 0) where variant_id = it.variant_id;
      insert into public.inventory_movements (variant_id, type, quantity, reason, actor_id, order_id)
      values (it.variant_id, 'release', it.quantity,
              case when p_to = 'expired' then 'Reserva expirada do pedido #' else 'Pedido cancelado #' end || o.number, p_actor, o.id);
    elsif o.status = 'paid' and p_to = 'canceled' then -- já baixado: volta ao estoque físico
      update public.inventory set on_hand = on_hand + it.quantity where variant_id = it.variant_id;
      insert into public.inventory_movements (variant_id, type, quantity, reason, actor_id, order_id)
      values (it.variant_id, 'return', it.quantity, 'Cancelamento após pagamento #' || o.number, p_actor, o.id);
    end if;
  end loop;

  update public.orders
     set status = p_to,
         reserved_until = case when p_to = 'pending_payment' then reserved_until else null end
   where id = o.id;
  insert into public.order_events (order_id, from_status, to_status, note, actor_id)
  values (o.id, o.status, p_to, nullif(trim(coalesce(p_note, '')), ''), p_actor);
  return p_to;
end;
$$;

create or replace function public.release_expired_reservations()
returns int
language plpgsql
security definer
set search_path = ''
as $$
declare
  oid uuid;
  n int := 0;
begin
  for oid in
    select id from public.orders
     where status = 'pending_payment' and reserved_until < now()
     order by reserved_until
     for update skip locked
  loop
    perform public.apply_order_transition(oid, 'expired', 'Reserva expirou sem pagamento', null);
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.apply_order_transition(uuid, text, text, uuid) from public, anon, authenticated;
revoke all on function public.release_expired_reservations() from public, anon, authenticated;
grant execute on function public.release_expired_reservations() to service_role;

-- ---------------------------------------------------------------------------
-- Cotação da sacola (pública): preço atual, disponibilidade e limite por item
-- ---------------------------------------------------------------------------
create or replace function public.quote_cart(p_items jsonb, p_cep text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  s public.store_settings%rowtype;
  lines jsonb;
  subtotal int;
begin
  select * into s from public.store_settings;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) > s.max_items_per_order then
    raise exception 'sacola inválida' using errcode = '22023';
  end if;

  with req as (
    select (e ->> 'variant_id')::uuid as variant_id, sum((e ->> 'quantity')::int)::int as quantity
      from jsonb_array_elements(p_items) e
     where (e ->> 'variant_id') ~ '^[0-9a-fA-F-]{36}$' and (e ->> 'quantity') ~ '^[0-9]{1,3}$'
     group by 1
  ), q as (
    select r.variant_id, r.quantity, v.sku, v.volume_ml, v.price_cents, v.compare_at_cents, v.price_is_reference,
           p.name, p.slug, b.name as brand_name,
           (v.id is not null and v.is_active and p.status = 'published' and b.is_active) as sellable,
           least(greatest(coalesce(i.on_hand - i.reserved, 0), 0), s.max_qty_per_item) as max_qty,
           img.storage_path, img.external_url
      from req r
      left join public.product_variants v on v.id = r.variant_id
      left join public.products p on p.id = v.product_id
      left join public.brands b on b.id = p.brand_id
      left join public.inventory i on i.variant_id = v.id
      left join lateral (
        select pi.storage_path, pi.external_url from public.product_images pi
         where pi.product_id = p.id order by pi.is_primary desc, pi.position limit 1
      ) img on true
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'variant_id', q.variant_id, 'requested', q.quantity,
           'available', q.sellable and q.max_qty > 0,
           'max_qty', case when q.sellable then q.max_qty else 0 end,
           'quantity', case when q.sellable then least(q.quantity, q.max_qty) else 0 end,
           'sku', q.sku, 'name', q.name, 'slug', q.slug, 'brand_name', q.brand_name, 'volume_ml', q.volume_ml,
           'price_cents', q.price_cents, 'compare_at_cents', q.compare_at_cents, 'price_is_reference', q.price_is_reference,
           'line_total_cents', case when q.sellable then q.price_cents * least(q.quantity, q.max_qty) else 0 end,
           'image_path', q.storage_path, 'image_url', q.external_url
         ) order by q.name, q.volume_ml), '[]'::jsonb),
         coalesce(sum(case when q.sellable then q.price_cents * least(q.quantity, q.max_qty) else 0 end), 0)::int
    into lines, subtotal
    from q;

  return jsonb_build_object(
    'lines', lines,
    'subtotal_cents', subtotal,
    'shipping', case when p_cep is null then null else public.shipping_quote(p_cep, subtotal) end,
    'free_shipping_over_cents', s.free_shipping_over_cents,
    'max_qty_per_item', s.max_qty_per_item
  );
end;
$$;

revoke all on function public.quote_cart(jsonb, text) from public;
grant execute on function public.quote_cart(jsonb, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Criação do pedido (somente service role)
-- ---------------------------------------------------------------------------
create or replace function public.create_order(
  p_idempotency_key uuid,
  p_user_id uuid,
  p_items jsonb,
  p_customer jsonb,
  p_address jsonb,
  p_payment_method text,
  p_privacy_accepted boolean
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

  ship := public.shipping_quote(cep, subtotal);
  if ship is null then
    raise exception 'CEP inválido' using errcode = '22023';
  end if;

  insert into public.orders (
    user_id, idempotency_key, customer_name, customer_email, customer_phone,
    ship_cep, ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state,
    shipping_label, shipping_days_min, shipping_days_max, payment_method,
    subtotal_cents, shipping_cents, discount_cents, total_cents, reserved_until, privacy_accepted_at)
  values (
    p_user_id, p_idempotency_key, trim(p_customer ->> 'name'), lower(trim(p_customer ->> 'email')),
    nullif(regexp_replace(coalesce(p_customer ->> 'phone', ''), '\D', '', 'g'), ''),
    cep, trim(p_address ->> 'street'), trim(p_address ->> 'number'), nullif(trim(coalesce(p_address ->> 'complement', '')), ''),
    trim(p_address ->> 'district'), trim(p_address ->> 'city'), upper(trim(p_address ->> 'state')),
    ship ->> 'label', (ship ->> 'days_min')::int, (ship ->> 'days_max')::int, p_payment_method,
    subtotal, (ship ->> 'price_cents')::int, 0, subtotal + (ship ->> 'price_cents')::int,
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
  values (new_order.id, null, 'pending_payment', 'Pedido criado; estoque reservado até o pagamento', p_user_id);

  return jsonb_build_object('order_id', new_order.id, 'number', new_order.number, 'token', new_order.public_token,
                            'total_cents', new_order.total_cents, 'replayed', false);
end;
$$;

revoke all on function public.create_order(uuid, uuid, jsonb, jsonb, jsonb, text, boolean) from public, anon, authenticated;
grant execute on function public.create_order(uuid, uuid, jsonb, jsonb, jsonb, text, boolean) to service_role;

-- ---------------------------------------------------------------------------
-- Acompanhamento pelo link (cliente sem cadastro): o token é a credencial
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
    'discount_cents', o.discount_cents, 'total_cents', o.total_cents,
    'is_demo', o.is_demo,
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

revoke all on function public.get_order_public(text) from public;
grant execute on function public.get_order_public(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Painel: mudança de status (com efeito no estoque) e indicadores
-- ---------------------------------------------------------------------------
create or replace function public.admin_update_order_status(p_order_id uuid, p_status text, p_note text default null)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_role('admin') then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
  if p_status not in ('paid', 'shipped', 'delivered', 'canceled') then
    raise exception 'status inválido' using errcode = '22023';
  end if;
  perform public.release_expired_reservations();
  return public.apply_order_transition(p_order_id, p_status, coalesce(nullif(trim(coalesce(p_note, '')), ''),
    case p_status when 'paid' then 'Pagamento confirmado manualmente no painel (demonstração)' end), auth.uid());
end;
$$;

revoke all on function public.admin_update_order_status(uuid, text, text) from public, anon;
grant execute on function public.admin_update_order_status(uuid, text, text) to authenticated;

create or replace function public.admin_dashboard_stats()
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
  return jsonb_build_object(
    'products_published', (select count(*) from public.products where status = 'published'),
    'products_draft', (select count(*) from public.products where status = 'draft'),
    'products_archived', (select count(*) from public.products where status = 'archived'),
    'review_pending', (select count(*) from public.products where commercial_review = 'pending' and status <> 'archived'),
    'reference_prices', (select count(*) from public.product_variants where price_is_reference and is_active),
    'variants_active', (select count(*) from public.product_variants where is_active),
    'low_stock', (select count(*) from public.inventory where stock_status = 'low_stock'),
    'out_of_stock', (select count(*) from public.product_variants v left join public.inventory i on i.variant_id = v.id
                      where v.is_active and coalesce(i.stock_status, 'out_of_stock') = 'out_of_stock'),
    'demo_stock', (select count(*) from public.inventory where is_demo_quantity),
    'orders_pending', (select count(*) from public.orders where status = 'pending_payment' and reserved_until >= now()),
    'orders_to_ship', (select count(*) from public.orders where status = 'paid'),
    'orders_total', (select count(*) from public.orders),
    'revenue_paid_cents', (select coalesce(sum(total_cents), 0) from public.orders where status in ('paid', 'shipped', 'delivered'))
  );
end;
$$;

-- Painel: libera reservas vencidas antes de listar pedidos/estoque (sem depender de cron).
create or replace function public.admin_release_expired_reservations()
returns int
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.has_role('admin') then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
  return public.release_expired_reservations();
end;
$$;

revoke all on function public.admin_release_expired_reservations() from public, anon;
grant execute on function public.admin_release_expired_reservations() to authenticated;
