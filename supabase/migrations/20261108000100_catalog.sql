-- =============================================================================
-- Sally Perfumaria — Catálogo, papéis administrativos e estoque
-- Compatível com Supabase (Postgres 15+). Testada localmente em PGlite (tests/db).
-- Valores monetários: inteiros em centavos.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Utilitários
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Normaliza texto para busca (minúsculas, sem acentos) sem depender de extensões.
create or replace function public.normalize_search(input text)
returns text
language sql
immutable
set search_path = ''
as $$
  select lower(translate(coalesce(input, ''),
    'ÁÀÂÃÄÅáàâãäåÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ',
    'AAAAAAaaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn'));
$$;

-- Agrupa a família olfativa detalhada em grupos para filtro (pela primeira palavra).
create or replace function public.family_group(family text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case split_part(public.normalize_search(family), ' ', 1)
    when 'floral' then 'Floral'
    when 'chipre' then 'Chipre'
    when 'oriental' then 'Oriental'
    when 'ambarado' then 'Oriental'
    when 'ambar' then 'Oriental'
    when 'amadeirado' then 'Amadeirado'
    when 'aromatico' then 'Aromático'
    when 'fougere' then 'Aromático'
    when 'aquatico' then 'Aquático'
    when 'citrico' then 'Cítrico'
    when 'gourmand' then 'Gourmand'
    else null
  end;
$$;

-- ---------------------------------------------------------------------------
-- Papéis (RBAC). "customer" é o padrão implícito: ausência de linha aqui.
-- Somente o service role grava nesta tabela (nenhuma policy de escrita).
-- ---------------------------------------------------------------------------
create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'owner')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

alter table public.user_roles enable row level security;

create policy "usuário lê os próprios papéis"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- owner tem todas as permissões de admin.
create or replace function public.has_role(required text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = (select auth.uid())
      and (ur.role = required or ur.role = 'owner')
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Marcas e categorias
-- ---------------------------------------------------------------------------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  position int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger brands_updated_at before update on public.brands
  for each row execute function public.set_updated_at();
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Produtos (conteúdo) e variantes (SKU: volume, preço, estoque)
-- ---------------------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  seed_key text unique,                    -- identificador estável do seed (idempotência)
  brand_id uuid not null references public.brands (id),
  category_id uuid not null references public.categories (id),
  name text not null check (length(name) between 1 and 160),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  short_description text check (length(short_description) <= 280),
  description text,
  gender text not null check (gender in ('feminino', 'masculino', 'unissex')),
  origin text not null check (origin in ('nacional', 'importado')),
  concentration text,
  olfactory_family text,
  family_group text generated always as (public.family_group(olfactory_family)) stored,
  top_notes text[],
  heart_notes text[],
  base_notes text[],
  highlights text[],                       -- ingredientes citados quando não há pirâmide confirmada
  occasion text,
  manufacturer text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  featured boolean not null default false,
  commercial_review text not null default 'pending' check (commercial_review in ('pending', 'approved')),
  data_sources jsonb not null default '{}'::jsonb,
  search_text text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_status_idx on public.products (status);
create index products_brand_idx on public.products (brand_id);
create index products_category_idx on public.products (category_id);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text not null unique check (sku ~ '^[A-Z0-9][A-Z0-9-]{2,63}$'),
  barcode text check (barcode ~ '^[0-9]{8,14}$'),
  volume_ml int check (volume_ml > 0 and volume_ml <= 5000),
  price_cents int not null check (price_cents > 0),
  compare_at_cents int check (compare_at_cents is null or compare_at_cents > price_cents),
  price_is_reference boolean not null default true, -- preço de referência ainda não confirmado pelo proprietário
  weight_g int check (weight_g > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_variants_product_idx on public.product_variants (product_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text,                       -- caminho no bucket product-images (preferencial)
  external_url text,                       -- fallback enquanto a imagem não foi enviada ao Storage
  alt text not null,
  position int not null default 0,
  is_primary boolean not null default false,
  source_url text,                         -- origem documentada da imagem
  license_note text,
  created_at timestamptz not null default now(),
  check (storage_path is not null or external_url is not null),
  unique (product_id, position)
);

create unique index product_images_one_primary on public.product_images (product_id) where is_primary;

create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();
create trigger product_variants_updated_at before update on public.product_variants
  for each row execute function public.set_updated_at();

-- search_text = nome + marca + família + notas, normalizado (sem acento).
create or replace function public.products_build_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  brand_name text;
begin
  select b.name into brand_name from public.brands b where b.id = new.brand_id;
  new.search_text := public.normalize_search(concat_ws(' ',
    new.name, brand_name, new.olfactory_family, new.concentration,
    array_to_string(new.top_notes, ' '), array_to_string(new.heart_notes, ' '),
    array_to_string(new.base_notes, ' '), array_to_string(new.highlights, ' ')));
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger products_search_text before insert or update on public.products
  for each row execute function public.products_build_search_text();

-- ---------------------------------------------------------------------------
-- Estoque
-- ---------------------------------------------------------------------------
create table public.inventory (
  variant_id uuid primary key references public.product_variants (id) on delete cascade,
  on_hand int not null default 0 check (on_hand >= 0),
  reserved int not null default 0 check (reserved >= 0),
  min_stock int not null default 3 check (min_stock >= 0),
  is_demo_quantity boolean not null default true, -- true até o proprietário confirmar a contagem real
  stock_status text generated always as (
    case
      when on_hand - reserved <= 0 then 'out_of_stock'
      when on_hand - reserved <= min_stock then 'low_stock'
      else 'in_stock'
    end
  ) stored,
  updated_at timestamptz not null default now(),
  check (reserved <= on_hand)
);

create trigger inventory_updated_at before update on public.inventory
  for each row execute function public.set_updated_at();

create table public.inventory_movements (
  id bigint generated always as identity primary key,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  type text not null check (type in ('seed', 'in', 'adjust', 'reserve', 'release', 'sale', 'return')),
  quantity int not null check (quantity <> 0),  -- delta assinado
  reason text,
  actor_id uuid references auth.users (id),
  created_at timestamptz not null default now()
);

create index inventory_movements_variant_idx on public.inventory_movements (variant_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;

-- Leitura pública somente do que está ativo/publicado.
create policy "marcas ativas são públicas" on public.brands
  for select to anon, authenticated using (is_active or public.has_role('admin'));
create policy "categorias ativas são públicas" on public.categories
  for select to anon, authenticated using (is_active or public.has_role('admin'));
create policy "produtos publicados são públicos" on public.products
  for select to anon, authenticated using (status = 'published' or public.has_role('admin'));
create policy "variantes de produtos publicados são públicas" on public.product_variants
  for select to anon, authenticated using (
    (is_active and exists (
      select 1 from public.products p where p.id = product_id and p.status = 'published'))
    or public.has_role('admin'));
create policy "imagens de produtos publicados são públicas" on public.product_images
  for select to anon, authenticated using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
    or public.has_role('admin'));
create policy "disponibilidade de variantes publicadas é pública" on public.inventory
  for select to anon, authenticated using (
    exists (
      select 1 from public.product_variants v
      join public.products p on p.id = v.product_id
      where v.id = variant_id and v.is_active and p.status = 'published')
    or public.has_role('admin'));
create policy "movimentações visíveis só ao admin" on public.inventory_movements
  for select to authenticated using (public.has_role('admin'));

-- Escrita: somente admin (o servidor ainda valida requireRole antes). Clientes nunca escrevem.
create policy "admin gerencia marcas" on public.brands
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "admin gerencia categorias" on public.categories
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "admin gerencia produtos" on public.products
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "admin gerencia variantes" on public.product_variants
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
create policy "admin gerencia imagens" on public.product_images
  for all to authenticated using (public.has_role('admin')) with check (public.has_role('admin'));
-- inventory e inventory_movements: sem policy de escrita para clientes; alterações passam
-- por funções transacionais (Fase 5/6) executadas no servidor.

-- Privilégios de coluna: o público vê o STATUS do estoque, nunca as quantidades.
revoke all on public.inventory from anon, authenticated;
grant select (variant_id, stock_status) on public.inventory to anon, authenticated;
revoke all on public.inventory_movements from anon;
revoke all on public.user_roles from anon;
revoke insert, update, delete on public.user_roles from authenticated;

-- ---------------------------------------------------------------------------
-- View de listagem do catálogo (respeita a RLS de quem consulta)
-- ---------------------------------------------------------------------------
create view public.catalog_products
with (security_invoker = true)
as
select
  p.id,
  p.slug,
  p.name,
  p.short_description,
  p.gender,
  p.origin,
  p.concentration,
  p.olfactory_family,
  p.family_group,
  p.featured,
  p.search_text,
  p.published_at,
  p.created_at,
  b.name as brand_name,
  b.slug as brand_slug,
  c.slug as category_slug,
  c.name as category_name,
  v.min_price_cents,
  v.max_price_cents,
  v.variant_count,
  v.volumes_ml,
  v.has_promo,
  v.max_discount_percent,
  coalesce(s.in_stock, false) as in_stock,
  img.storage_path as image_path,
  img.external_url as image_url,
  img.alt as image_alt
from public.products p
join public.brands b on b.id = p.brand_id
join public.categories c on c.id = p.category_id
join lateral (
  select
    min(pv.price_cents) as min_price_cents,
    max(pv.price_cents) as max_price_cents,
    count(*)::int as variant_count,
    array_agg(pv.volume_ml order by pv.volume_ml) as volumes_ml,
    bool_or(pv.compare_at_cents is not null) as has_promo,
    max(case when pv.compare_at_cents is not null
      then round(((pv.compare_at_cents - pv.price_cents) * 100.0) / pv.compare_at_cents)::int
      else 0 end) as max_discount_percent
  from public.product_variants pv
  where pv.product_id = p.id and pv.is_active
) v on v.variant_count > 0
left join lateral (
  select bool_or(i.stock_status <> 'out_of_stock') as in_stock
  from public.product_variants pv
  join public.inventory i on i.variant_id = pv.id
  where pv.product_id = p.id and pv.is_active
) s on true
left join lateral (
  select pi.storage_path, pi.external_url, pi.alt
  from public.product_images pi
  where pi.product_id = p.id
  order by pi.is_primary desc, pi.position
  limit 1
) img on true;

grant select on public.catalog_products to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Storage: bucket de imagens de produtos (leitura pública, escrita só admin)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "admin envia imagens de produtos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.has_role('admin'));
create policy "admin atualiza imagens de produtos" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin'));
create policy "admin remove imagens de produtos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.has_role('admin'));
