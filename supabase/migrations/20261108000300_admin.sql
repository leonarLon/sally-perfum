-- Sally Perfumaria — Fase 5: painel administrativo.
-- Auditoria automática (triggers, só leitura para admin), operações de estoque
-- transacionais com verificação de papel, troca atômica da imagem principal e a
-- policy de leitura do Storage que o "remove" da API exige.

-- ---------------------------------------------------------------------------
-- Auditoria: preenchida SOMENTE por trigger. Ninguém grava, altera ou apaga pela API.
-- ---------------------------------------------------------------------------
create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null, -- null = sistema (seed/service role)
  action text not null check (action in ('insert', 'update', 'delete')),
  entity text not null,
  entity_id text not null,
  changes jsonb not null default '{}'::jsonb, -- update: {campo: {de, para}}; insert/delete: a linha
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity, entity_id, created_at desc);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

alter table public.audit_logs enable row level security;

create policy "admin lê a auditoria" on public.audit_logs
  for select to authenticated using (public.has_role('admin'));

revoke all on public.audit_logs from anon;
revoke insert, update, delete, truncate on public.audit_logs from authenticated;

-- tg_argv[0] = coluna que identifica a linha. search_text/updated_at são derivados: fora do diff.
create or replace function public.audit_row_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_j jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) - 'search_text' - 'updated_at' end;
  new_j jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) - 'search_text' - 'updated_at' end;
  diff jsonb;
begin
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(n.key, jsonb_build_object('de', old_j -> n.key, 'para', n.value)), '{}'::jsonb)
      into diff
      from jsonb_each(new_j) n
     where n.value is distinct from old_j -> n.key;
    if diff = '{}'::jsonb then
      return null; -- nada mudou de fato
    end if;
  elsif tg_op = 'INSERT' then
    diff := new_j;
  else
    diff := old_j;
  end if;

  insert into public.audit_logs (actor_id, action, entity, entity_id, changes)
  values (auth.uid(), lower(tg_op), tg_table_name, coalesce(new_j, old_j) ->> tg_argv[0], diff);
  return null;
end;
$$;

revoke all on function public.audit_row_change() from public, anon, authenticated;

create trigger audit_brands after insert or update or delete on public.brands
  for each row execute function public.audit_row_change('id');
create trigger audit_categories after insert or update or delete on public.categories
  for each row execute function public.audit_row_change('id');
create trigger audit_products after insert or update or delete on public.products
  for each row execute function public.audit_row_change('id');
create trigger audit_product_variants after insert or update or delete on public.product_variants
  for each row execute function public.audit_row_change('id');
create trigger audit_product_images after insert or update or delete on public.product_images
  for each row execute function public.audit_row_change('id');
create trigger audit_inventory after insert or update or delete on public.inventory
  for each row execute function public.audit_row_change('variant_id');
create trigger audit_user_roles after insert or update or delete on public.user_roles
  for each row execute function public.audit_row_change('user_id');

-- ---------------------------------------------------------------------------
-- Estoque (admin). As quantidades continuam invisíveis para anon/authenticated
-- por privilégio de coluna; o admin as lê e altera só por estas funções.
-- ---------------------------------------------------------------------------

-- p_mode 'set' = contagem conferida (marca a quantidade como real, não demo);
-- p_mode 'in'  = entrada de mercadoria (soma p_quantity > 0).
create or replace function public.admin_update_stock(
  p_variant_id uuid,
  p_mode text,
  p_quantity int,
  p_min_stock int,
  p_reason text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  cur public.inventory%rowtype;
  new_on_hand int;
  delta int;
  reason text := trim(coalesce(p_reason, ''));
begin
  if not public.has_role('admin') then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
  if p_mode is null or p_mode not in ('set', 'in') then
    raise exception 'modo inválido' using errcode = '22023';
  end if;
  if p_quantity is null or p_quantity < 0 or p_quantity > 100000 or (p_mode = 'in' and p_quantity = 0) then
    raise exception 'quantidade inválida' using errcode = '22023';
  end if;
  if p_min_stock is null or p_min_stock < 0 or p_min_stock > 10000 then
    raise exception 'estoque mínimo inválido' using errcode = '22023';
  end if;
  if length(reason) < 3 or length(reason) > 200 then
    raise exception 'informe o motivo (3 a 200 caracteres)' using errcode = '22023';
  end if;
  if not exists (select 1 from public.product_variants v where v.id = p_variant_id) then
    raise exception 'variante inexistente' using errcode = 'P0002';
  end if;

  -- Variantes criadas pelo painel ainda não têm linha de estoque.
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values (p_variant_id, 0, p_min_stock, false)
  on conflict (variant_id) do nothing;

  select * into cur from public.inventory i where i.variant_id = p_variant_id for update;

  new_on_hand := case when p_mode = 'set' then p_quantity else cur.on_hand + p_quantity end;
  if new_on_hand > 100000 then
    raise exception 'quantidade inválida' using errcode = '22023';
  end if;
  if new_on_hand < cur.reserved then
    raise exception 'a quantidade não pode ficar abaixo da reservada (%)', cur.reserved using errcode = '23514';
  end if;
  delta := new_on_hand - cur.on_hand;

  update public.inventory i
     set on_hand = new_on_hand,
         min_stock = p_min_stock,
         is_demo_quantity = case when p_mode = 'set' then false else i.is_demo_quantity end
   where i.variant_id = p_variant_id;

  if delta <> 0 then
    insert into public.inventory_movements (variant_id, type, quantity, reason, actor_id)
    values (p_variant_id, case when p_mode = 'in' then 'in' else 'adjust' end, delta, reason, auth.uid());
  end if;

  return (
    select jsonb_build_object(
      'on_hand', i.on_hand, 'reserved', i.reserved, 'min_stock', i.min_stock,
      'stock_status', i.stock_status, 'is_demo_quantity', i.is_demo_quantity, 'delta', delta)
    from public.inventory i where i.variant_id = p_variant_id
  );
end;
$$;

create or replace function public.admin_list_inventory(
  p_q text default null,
  p_status text default null,
  p_product_id uuid default null
)
returns table (
  variant_id uuid,
  sku text,
  volume_ml int,
  variant_active boolean,
  product_id uuid,
  product_name text,
  product_status text,
  brand_name text,
  on_hand int,
  reserved int,
  available int,
  min_stock int,
  stock_status text,
  is_demo_quantity boolean,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  q text := nullif(trim(coalesce(p_q, '')), '');
begin
  if not public.has_role('admin') then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
  return query
  select v.id, v.sku, v.volume_ml, v.is_active, p.id, p.name, p.status, b.name,
         coalesce(i.on_hand, 0), coalesce(i.reserved, 0), coalesce(i.on_hand - i.reserved, 0),
         coalesce(i.min_stock, 3), coalesce(i.stock_status, 'out_of_stock'),
         coalesce(i.is_demo_quantity, false), i.updated_at
    from public.product_variants v
    join public.products p on p.id = v.product_id
    join public.brands b on b.id = p.brand_id
    left join public.inventory i on i.variant_id = v.id
   where (q is null
          or p.search_text like '%' || public.normalize_search(q) || '%'
          or v.sku ilike '%' || q || '%')
     and (p_status is null or coalesce(i.stock_status, 'out_of_stock') = p_status)
     and (p_product_id is null or p.id = p_product_id)
   order by coalesce(i.stock_status, 'out_of_stock') = 'in_stock', p.name, v.volume_ml;
end;
$$;

-- Indicadores do painel (contagens agregadas; nada pessoal).
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
    'demo_stock', (select count(*) from public.inventory where is_demo_quantity)
  );
end;
$$;

revoke all on function public.admin_update_stock(uuid, text, int, int, text) from public, anon;
revoke all on function public.admin_list_inventory(text, text, uuid) from public, anon;
revoke all on function public.admin_dashboard_stats() from public, anon;
grant execute on function public.admin_update_stock(uuid, text, int, int, text) to authenticated;
grant execute on function public.admin_list_inventory(text, text, uuid) to authenticated;
grant execute on function public.admin_dashboard_stats() to authenticated;

-- ---------------------------------------------------------------------------
-- Imagem principal: troca atômica (o índice único parcial impede duas principais).
-- SECURITY INVOKER: quem chama precisa passar pela RLS de admin em product_images.
-- ---------------------------------------------------------------------------
create or replace function public.admin_set_primary_image(p_image_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  pid uuid;
begin
  select pi.product_id into pid from public.product_images pi where pi.id = p_image_id;
  if pid is null then
    raise exception 'imagem inexistente' using errcode = 'P0002';
  end if;
  update public.product_images set is_primary = false where product_id = pid and is_primary and id <> p_image_id;
  update public.product_images set is_primary = true where id = p_image_id;
  if not found then
    raise exception 'permissão negada' using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.admin_set_primary_image(uuid) from public, anon;
grant execute on function public.admin_set_primary_image(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Storage: a API exige SELECT para remover/substituir objetos.
-- (Leitura pública das imagens continua pela URL pública do bucket.)
-- ---------------------------------------------------------------------------
create policy "admin lê objetos de imagens de produtos" on storage.objects
  for select to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin'));
