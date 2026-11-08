-- Sally Perfumaria — Fase 8: pagamentos (provedor simulado) e webhooks.
--
-- * Uma cobrança (payments) por tentativa; só uma pendente por pedido.
-- * A confirmação vem SOMENTE por evento do provedor (webhook assinado, verificado no
--   servidor) aplicado por apply_payment_event: idempotente pelo id do evento, confere o
--   valor e só então marca o pedido como pago (o que baixa o estoque).
-- * Pagamento aprovado para pedido que já expirou/cancelou fica marcado para estorno.
-- * Cancelar um pedido pago estorna a cobrança aprovada (simulado).
-- * Nenhum dado de cartão é guardado: só a bandeira e os 4 últimos dígitos informados
--   pelo "token" do provedor.

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null check (provider in ('fake')),
  provider_ref text not null check (length(provider_ref) between 8 and 120),
  method text not null check (method in ('pix', 'card', 'boleto')),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'declined', 'expired', 'canceled', 'refunded', 'review')),
  amount_cents int not null check (amount_cents > 0),
  pix_code text,
  boleto_line text,
  card_brand text,
  card_last4 text check (card_last4 ~ '^[0-9]{4}$'),
  needs_refund boolean not null default false,
  failure_reason text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_ref)
);

create index payments_order_idx on public.payments (order_id, created_at desc);
create unique index payments_one_pending_per_order on public.payments (order_id) where status = 'pending';

create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

-- Eventos recebidos (auditoria e idempotência: o mesmo evento nunca é aplicado duas vezes).
create table public.payment_events (
  id bigint generated always as identity primary key,
  provider text not null,
  event_id text not null check (length(event_id) between 8 and 120),
  type text not null,
  provider_ref text not null,
  amount_cents int,
  payload jsonb not null default '{}'::jsonb,
  result text,
  received_at timestamptz not null default now(),
  unique (provider, event_id)
);

alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

create policy "cliente vê pagamentos dos próprios pedidos; admin vê todos" on public.payments
  for select to authenticated using (exists (
    select 1 from public.orders o where o.id = order_id and (o.user_id = (select auth.uid()) or public.has_role('admin'))));
create policy "admin vê eventos de pagamento" on public.payment_events
  for select to authenticated using (public.has_role('admin'));

revoke all on public.payments, public.payment_events from anon;
revoke insert, update, delete, truncate on public.payments, public.payment_events from authenticated;

-- ---------------------------------------------------------------------------
-- Criação da cobrança (somente service role, depois de validar o token do pedido)
-- ---------------------------------------------------------------------------
create or replace function public.create_payment(
  p_order_id uuid,
  p_provider text,
  p_provider_ref text,
  p_method text,
  p_amount_cents int,
  p_pix_code text default null,
  p_boleto_line text default null,
  p_card_brand text default null,
  p_card_last4 text default null,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  o public.orders%rowtype;
  pid uuid;
begin
  perform public.release_expired_reservations();
  select * into o from public.orders where id = p_order_id for update;
  if not found then
    raise exception 'pedido inexistente' using errcode = 'P0002';
  end if;
  if o.status <> 'pending_payment' then
    raise exception 'PEDIDO_NAO_PENDENTE:%', o.status using errcode = 'P0001';
  end if;
  if p_amount_cents is distinct from o.total_cents then
    raise exception 'valor da cobrança diferente do total do pedido' using errcode = '22023';
  end if;

  -- Nova tentativa substitui a pendente anterior (ex.: trocou Pix por cartão).
  update public.payments set status = 'canceled', failure_reason = 'Substituída por nova tentativa'
   where order_id = o.id and status = 'pending';

  insert into public.payments (order_id, provider, provider_ref, method, amount_cents, pix_code, boleto_line,
                               card_brand, card_last4, expires_at)
  values (o.id, p_provider, p_provider_ref, p_method, p_amount_cents, p_pix_code, p_boleto_line,
          p_card_brand, p_card_last4, least(coalesce(p_expires_at, o.reserved_until), o.reserved_until))
  returning id into pid;

  update public.orders set payment_method = p_method where id = o.id and payment_method <> p_method;
  return pid;
end;
$$;

-- ---------------------------------------------------------------------------
-- Aplicação de evento do provedor (somente service role, após verificar a assinatura)
-- ---------------------------------------------------------------------------
create or replace function public.apply_payment_event(
  p_provider text,
  p_event_id text,
  p_type text,
  p_provider_ref text,
  p_amount_cents int,
  p_payload jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  ev_id bigint;
  p public.payments%rowtype;
  o public.orders%rowtype;
  v_result text;
begin
  if p_type not in ('payment.approved', 'payment.declined', 'payment.expired', 'payment.refunded') then
    raise exception 'tipo de evento desconhecido' using errcode = '22023';
  end if;

  insert into public.payment_events (provider, event_id, type, provider_ref, amount_cents, payload)
  values (p_provider, p_event_id, p_type, p_provider_ref, p_amount_cents, coalesce(p_payload, '{}'::jsonb))
  on conflict (provider, event_id) do nothing
  returning id into ev_id;
  if ev_id is null then
    return jsonb_build_object('duplicate', true);
  end if;

  select * into p from public.payments where provider = p_provider and provider_ref = p_provider_ref for update;
  if not found then
    update public.payment_events set result = 'cobrança desconhecida' where id = ev_id;
    return jsonb_build_object('duplicate', false, 'result', 'unknown_payment');
  end if;

  perform public.release_expired_reservations();
  select * into o from public.orders where id = p.order_id for update;

  if p_type = 'payment.approved' then
    if p.status = 'approved' then
      v_result := 'already_approved';
    elsif p_amount_cents is distinct from p.amount_cents or p.amount_cents <> o.total_cents then
      update public.payments set status = 'review', failure_reason = 'Valor pago diferente do cobrado' where id = p.id;
      v_result := 'amount_mismatch';
    elsif o.status = 'pending_payment' then
      update public.payments set status = 'approved', failure_reason = null where id = p.id;
      -- Outras tentativas pendentes do mesmo pedido deixam de valer.
      update public.payments set status = 'canceled', failure_reason = 'Pedido pago por outra tentativa'
       where order_id = o.id and status = 'pending' and id <> p.id;
      perform public.apply_order_transition(o.id, 'paid', 'Pagamento aprovado (' || p.method || ', provedor ' || p.provider || ')', null);
      v_result := 'order_paid';
    else
      update public.payments set status = 'approved', needs_refund = true,
             failure_reason = 'Aprovado após o pedido ficar ' || o.status where id = p.id;
      v_result := 'needs_refund';
    end if;
  elsif p_type = 'payment.declined' then
    if p.status = 'pending' then
      update public.payments set status = 'declined', failure_reason = coalesce(p_payload ->> 'reason', 'Recusado pelo emissor') where id = p.id;
    end if;
    v_result := 'declined';
  elsif p_type = 'payment.expired' then
    if p.status = 'pending' then
      update public.payments set status = 'expired' where id = p.id;
    end if;
    v_result := 'expired';
  else -- payment.refunded
    update public.payments set status = 'refunded', needs_refund = false where id = p.id;
    v_result := 'refunded';
  end if;

  update public.payment_events set result = v_result where id = ev_id;
  return jsonb_build_object('duplicate', false, 'result', v_result, 'order_status', (select status from public.orders where id = o.id));
end;
$$;

revoke all on function public.create_payment(uuid, text, text, text, int, text, text, text, text, timestamptz) from public, anon, authenticated;
revoke all on function public.apply_payment_event(text, text, text, text, int, jsonb) from public, anon, authenticated;
grant execute on function public.create_payment(uuid, text, text, text, int, text, text, text, text, timestamptz) to service_role;
grant execute on function public.apply_payment_event(text, text, text, text, int, jsonb) to service_role;

-- ---------------------------------------------------------------------------
-- Sincronia pedido → cobrança: cancelar/expirar o pedido encerra as cobranças
-- ---------------------------------------------------------------------------
create or replace function public.orders_sync_payments()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'canceled' and old.status in ('paid', 'shipped') then
    update public.payments set status = 'refunded', needs_refund = false,
           failure_reason = 'Estornado no cancelamento (simulado)'
     where order_id = new.id and status = 'approved';
  end if;
  if new.status in ('canceled', 'expired') then
    update public.payments set status = case when new.status = 'expired' then 'expired' else 'canceled' end
     where order_id = new.id and status = 'pending';
  end if;
  return null;
end;
$$;

revoke all on function public.orders_sync_payments() from public, anon, authenticated;

create trigger orders_sync_payments after update of status on public.orders
  for each row when (old.status is distinct from new.status)
  execute function public.orders_sync_payments();

-- ---------------------------------------------------------------------------
-- Link do pedido: inclui a cobrança mais recente (sem dados sensíveis)
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
