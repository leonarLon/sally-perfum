-- =============================================================================
-- Sally Perfumaria — Consultas do catálogo (RPC)
-- Todas são SECURITY INVOKER: respeitam a RLS de quem chama (anon/cliente/admin).
-- =============================================================================

-- Busca/listagem com filtros, ordenação e paginação. Retorna { total, items[] }.
create or replace function public.search_catalog(
  p_q text default null,
  p_gender text default null,
  p_origin text default null,
  p_brand text default null,
  p_category text default null,
  p_family text default null,
  p_promo boolean default false,
  p_in_stock boolean default false,
  p_min_price int default null,
  p_max_price int default null,
  p_sort text default 'relevance',
  p_page int default 1,
  p_page_size int default 24,
  p_exclude uuid default null
)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with params as (
    select
      least(greatest(coalesce(p_page_size, 24), 1), 48) as size,
      greatest(coalesce(p_page, 1), 1) as page,
      -- termos da busca: normalizados, sem curingas de LIKE
      array(
        select t from unnest(string_to_array(
          replace(replace(public.normalize_search(trim(coalesce(p_q, ''))), '%', ''), '_', ''), ' ')) t
        where t <> ''
      ) as terms
  ),
  filtered as (
    select c.*
    from public.catalog_products c, params
    where (cardinality(params.terms) = 0
           or not exists (select 1 from unnest(params.terms) t where c.search_text not like '%' || t || '%'))
      and (p_gender is null or c.gender = p_gender)
      and (p_origin is null or c.origin = p_origin)
      and (p_brand is null or c.brand_slug = p_brand)
      and (p_category is null or c.category_slug = p_category)
      and (p_family is null or c.family_group = p_family)
      and (not coalesce(p_promo, false) or c.has_promo)
      and (not coalesce(p_in_stock, false) or c.in_stock)
      and (p_min_price is null or c.min_price_cents >= p_min_price)
      and (p_max_price is null or c.min_price_cents <= p_max_price)
      and (p_exclude is null or c.id <> p_exclude)
  ),
  ordered as (
    select f.*,
      row_number() over (
        order by
          case when p_sort = 'price_asc' then f.min_price_cents end asc nulls last,
          case when p_sort = 'price_desc' then f.min_price_cents end desc nulls last,
          case when p_sort = 'newest' then f.published_at end desc nulls last,
          case when p_sort = 'discount' then f.max_discount_percent end desc nulls last,
          case when p_sort = 'name' then f.name end asc,
          f.in_stock desc,
          f.featured desc,
          f.name asc,
          f.id
      ) as rn
    from filtered f
  )
  select jsonb_build_object(
    'total', (select count(*) from filtered),
    'page', (select page from params),
    'page_size', (select size from params),
    'items', coalesce((
      select jsonb_agg(to_jsonb(o) - 'search_text' - 'rn' order by o.rn)
      from ordered o, params
      where o.rn > (params.page - 1) * params.size and o.rn <= params.page * params.size
    ), '[]'::jsonb)
  );
$$;

-- Detalhe do produto por slug (null se não existir ou não for visível para quem chama).
create or replace function public.get_product(p_slug text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'id', p.id,
    'slug', p.slug,
    'name', p.name,
    'short_description', p.short_description,
    'description', p.description,
    'gender', p.gender,
    'origin', p.origin,
    'concentration', p.concentration,
    'olfactory_family', p.olfactory_family,
    'family_group', p.family_group,
    'top_notes', p.top_notes,
    'heart_notes', p.heart_notes,
    'base_notes', p.base_notes,
    'highlights', p.highlights,
    'occasion', p.occasion,
    'status', p.status,
    'brand', jsonb_build_object('name', b.name, 'slug', b.slug),
    'category', jsonb_build_object('name', c.name, 'slug', c.slug),
    'variants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', v.id, 'sku', v.sku, 'volume_ml', v.volume_ml,
        'price_cents', v.price_cents, 'compare_at_cents', v.compare_at_cents,
        'price_is_reference', v.price_is_reference,
        'stock_status', coalesce(i.stock_status, 'out_of_stock')
      ) order by v.volume_ml nulls last, v.price_cents)
      from public.product_variants v
      left join public.inventory i on i.variant_id = v.id
      where v.product_id = p.id and v.is_active
    ), '[]'::jsonb),
    'images', coalesce((
      select jsonb_agg(jsonb_build_object(
        'storage_path', pi.storage_path, 'external_url', pi.external_url,
        'alt', pi.alt, 'is_primary', pi.is_primary
      ) order by pi.is_primary desc, pi.position)
      from public.product_images pi
      where pi.product_id = p.id
    ), '[]'::jsonb)
  )
  from public.products p
  join public.brands b on b.id = p.brand_id
  join public.categories c on c.id = p.category_id
  where p.slug = p_slug;
$$;

-- Facetas para os filtros (somente o que é visível para quem chama).
create or replace function public.catalog_facets()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'brands', coalesce((
      select jsonb_agg(jsonb_build_object('slug', brand_slug, 'name', brand_name, 'count', n) order by brand_name)
      from (select brand_slug, brand_name, count(*) n from public.catalog_products group by 1, 2) s
    ), '[]'::jsonb),
    'families', coalesce((
      select jsonb_agg(jsonb_build_object('name', family_group, 'count', n) order by family_group)
      from (select family_group, count(*) n from public.catalog_products where family_group is not null group by 1) s
    ), '[]'::jsonb),
    'price', (select jsonb_build_object('min', min(min_price_cents), 'max', max(min_price_cents)) from public.catalog_products)
  );
$$;

grant execute on function public.search_catalog(text, text, text, text, text, text, boolean, boolean, int, int, text, int, int, uuid) to anon, authenticated;
grant execute on function public.get_product(text) to anon, authenticated;
grant execute on function public.catalog_facets() to anon, authenticated;
