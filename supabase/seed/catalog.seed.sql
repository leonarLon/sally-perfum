-- GERADO por scripts/catalog/generate-seed-sql.mjs — não edite à mão.
-- 45 produtos | dados de referência (preços) e estoque de DEMONSTRAÇÃO.
begin;

-- Categorias
insert into public.categories (slug, name, position) values ('perfumes-femininos', 'Perfumes Femininos', 1)
  on conflict (slug) do update set name = excluded.name, position = excluded.position;
insert into public.categories (slug, name, position) values ('perfumes-masculinos', 'Perfumes Masculinos', 2)
  on conflict (slug) do update set name = excluded.name, position = excluded.position;
insert into public.categories (slug, name, position) values ('perfumes-unissex', 'Perfumes Unissex', 3)
  on conflict (slug) do update set name = excluded.name, position = excluded.position;

-- Marcas
insert into public.brands (slug, name) values ('lancome', 'Lancôme')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('carolina-herrera', 'Carolina Herrera')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('prada', 'Prada')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('chloe', 'Chloé')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('yves-saint-laurent', 'Yves Saint Laurent')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('dior', 'Dior')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('giorgio-armani', 'Giorgio Armani')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('dolce-e-gabbana', 'Dolce&Gabbana')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('burberry', 'Burberry')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('marc-jacobs', 'Marc Jacobs')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('jean-paul-gaultier', 'Jean Paul Gaultier')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('lattafa', 'Lattafa')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('valentino', 'Valentino')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('o-boticario', 'O Boticário')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('rabanne', 'Rabanne')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('azzaro', 'Azzaro')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('montblanc', 'Montblanc')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('versace', 'Versace')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('ralph-lauren', 'Ralph Lauren')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('hugo-boss', 'Hugo Boss')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('armaf', 'Armaf')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('calvin-klein', 'Calvin Klein')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('jo-malone-london', 'Jo Malone London')
  on conflict (slug) do update set name = excluded.name;
insert into public.brands (slug, name) values ('natura', 'Natura')
  on conflict (slug) do update set name = excluded.name;

-- Lancôme — La Vie Est Belle
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('la-vie-est-belle',
  (select id from public.brands where slug = 'lancome'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'La Vie Est Belle', 'la-vie-est-belle-lancome', 'Doce e luminoso, com íris e pralinê para qualquer ocasião.', 'La Vie Est Belle é uma fragrância feminina em versão Eau de Parfum de Lancôme, da família olfativa floral oriental gourmand. A composição abre com pera e cassis, revela no coração íris, jasmim e flor de laranjeira e assenta sobre patchouli, fava tonka, baunilha e pralinê. Sugestão de uso: qualquer ocasião.',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Oriental Gourmand',
  array['Pera', 'Cassis']::text[], array['Íris', 'Jasmim', 'Flor de Laranjeira']::text[], array['Patchouli', 'Fava Tonka', 'Baunilha', 'Pralinê']::text[], null, 'Qualquer ocasião',
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/lancome-la-vie-est-belle-eau-de-parfum-320071/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'SLY-LA-VIE-EST-BELLE-030', '3605532612690', 30, 32590, 52900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LA-VIE-EST-BELLE-030'), 5, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'SLY-LA-VIE-EST-BELLE-050', '3605532612768', 50, 48990, 79900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LA-VIE-EST-BELLE-050'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'SLY-LA-VIE-EST-BELLE-100', '3614273749381', 100, 65490, 87900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LA-VIE-EST-BELLE-100'), 15, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776131-800-800/17931244798812.jpg', 'La Vie Est Belle — Lancôme', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776131-800-800/17931244798812.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776129-800-800/17931244825869.jpg', 'La Vie Est Belle — Lancôme (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776129-800-800/17931244825869.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'la-vie-est-belle'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776130-800-800/17931244849753.jpg', 'La Vie Est Belle — Lancôme (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3776130-800-800/17931244849753.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Carolina Herrera — Good Girl
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('good-girl',
  (select id from public.brands where slug = 'carolina-herrera'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Good Girl', 'good-girl-carolina-herrera', 'Oriental floral marcante, no icônico frasco em forma de salto.', 'Good Girl é uma fragrância feminina em versão Eau de Parfum de Carolina Herrera, da família olfativa oriental floral. A pirâmide olfativa ainda não foi confirmada por fonte confiável.',
  'feminino', 'importado', 'Eau de Parfum', 'Oriental Floral',
  null, null, null, null, null,
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/good-girl--eau-de-parfum-feminino--30-ml-304241/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'good-girl'), 'SLY-GOOD-GIRL-030', '8411061823514', 30, 42800, 51360, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-GOOD-GIRL-030'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'good-girl'), 'SLY-GOOD-GIRL-050', '8411061819838', 50, 54100, 64920, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-GOOD-GIRL-050'), 9, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'good-girl'), 'SLY-GOOD-GIRL-150', '8411061958483', 150, 79300, 95160, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-GOOD-GIRL-150'), 24, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'good-girl'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438281-800-800/17788805478423.jpg', 'Good Girl — Carolina Herrera', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438281-800-800/17788805478423.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'good-girl'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438282-800-800/17788805502205.jpg', 'Good Girl — Carolina Herrera (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438282-800-800/17788805502205.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'good-girl'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438285-800-800/17788805488950.jpg', 'Good Girl — Carolina Herrera (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3438285-800-800/17788805488950.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Prada — Paradoxe
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('paradoxe',
  (select id from public.brands where slug = 'prada'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Paradoxe', 'paradoxe-prada', 'Floral ambarado moderno, em frasco refilável.', 'Paradoxe é uma fragrância feminina em versão Eau de Parfum de Prada, da família olfativa floral ambarado. A composição abre com botão de neroli, revela no coração âmbar (Ambrofi) e assenta sobre almíscar (Serenolide).',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Ambarado',
  array['Botão de Neroli']::text[], array['Âmbar (Ambrofi)']::text[], array['Almíscar (Serenolide)']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/prada-paradoxe-perfume-feminino-eau-de-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'paradoxe'), 'SLY-PARADOXE-030', '3614273760713', 30, 48900, 69899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-PARADOXE-030'), 25, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'paradoxe'), 'SLY-PARADOXE-050', '3614273760652', 50, 76700, 99899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-PARADOXE-050'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'paradoxe'), 'SLY-PARADOXE-090', '3614273760164', 90, 92100, 119900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-PARADOXE-090'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'paradoxe'), 'SLY-PARADOXE-100', '3614273760201', 100, 67000, 95899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-PARADOXE-100'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'paradoxe'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060660-800-800/3614273760713.01.jpg', 'Paradoxe — Prada', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060660-800-800/3614273760713.01.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'paradoxe'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060661-800-800/3614273760713.2.jpg', 'Paradoxe — Prada (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060661-800-800/3614273760713.2.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'paradoxe'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060662-800-800/3614273760164-3614273760201-3614273760652-3614273760713.03.jpg', 'Paradoxe — Prada (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3060662-800-800/3614273760164-3614273760201-3614273760652-3614273760713.03.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Chloé — Chloé
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('chloe-edp',
  (select id from public.brands where slug = 'chloe'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Chloé', 'chloe-chloe', 'Buquê de rosas delicado com toque de mel.', 'Chloé é uma fragrância feminina em versão Eau de Parfum de Chloé. A composição abre com lichia, peônia e frésia, revela no coração rosa, magnólia e lírio-do-vale e assenta sobre cedro, âmbar e mel.',
  'feminino', 'importado', 'Eau de Parfum', null,
  array['Lichia', 'Peônia', 'Frésia']::text[], array['Rosa', 'Magnólia', 'Lírio-do-vale']::text[], array['Cedro', 'Âmbar', 'Mel']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/chloe-de-chloe-eau-de-parfum-feminino-164414/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'chloe-edp'), 'SLY-CHLOE-EDP-030', '0688575201901', 30, 34030, 56800, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CHLOE-EDP-030'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'chloe-edp'), 'SLY-CHLOE-EDP-050', '3607346232347', 50, 54780, 80500, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CHLOE-EDP-050'), 10, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'chloe-edp'), 'SLY-CHLOE-EDP-075', '3607346232385', 75, 68060, 93500, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CHLOE-EDP-075'), 11, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'chloe-edp'), 'SLY-CHLOE-EDP-100', '3616302038633', 100, 78020, 99800, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CHLOE-EDP-100'), 24, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'chloe-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194079-800-800/17619462261126.jpg', 'Chloé — Chloé', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194079-800-800/17619462261126.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'chloe-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194078-800-800/17619462258625.jpg', 'Chloé — Chloé (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194078-800-800/17619462258625.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'chloe-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1204584-800-800/17619462266850.jpg', 'Chloé — Chloé (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1204584-800-800/17619462266850.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Lancôme — Idôle
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('idole',
  (select id from public.brands where slug = 'lancome'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Idôle', 'idole-lancome', 'Rosas limpas e luminosas, num chipre floral contemporâneo.', 'Idôle é uma fragrância feminina em versão Eau de Parfum de Lancôme, da família olfativa chipre floral. A composição abre com pera, bergamota, jasmim Sambac e jasmim Grandiflorum, revela no coração rosa Centifolia e rosa Damascena e assenta sobre acorde Chipre e almíscar branco.',
  'feminino', 'importado', 'Eau de Parfum', 'Chipre Floral',
  array['Pera', 'Bergamota', 'Jasmim Sambac', 'Jasmim Grandiflorum']::text[], array['Rosa Centifolia', 'Rosa Damascena']::text[], array['Acorde Chipre', 'Almíscar Branco']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/idole-lancome-feminino-eau-de-parfum-25ml-283600/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'idole'), 'SLY-IDOLE-025', '7893844721872', 25, 52900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-IDOLE-025'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'idole'), 'SLY-IDOLE-050', '7891881345280', 50, 80900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-IDOLE-050'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'idole'), 'SLY-IDOLE-100', '7893721017791', 100, 110900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-IDOLE-100'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'idole'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3118462-800-800/17882811401626.jpg', 'Idôle — Lancôme', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3118462-800-800/17882811401626.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'idole'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3302832-800-800/17882812139337.jpg', 'Idôle — Lancôme (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3302832-800-800/17882812139337.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'idole'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3184270-800-800/17882810941402.jpg', 'Idôle — Lancôme (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3184270-800-800/17882810941402.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Yves Saint Laurent — Libre
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('libre',
  (select id from public.brands where slug = 'yves-saint-laurent'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Libre', 'libre-yves-saint-laurent', 'Lavanda e flor de laranjeira em equilíbrio entre frescor e sensualidade.', 'Libre é uma fragrância feminina em versão Eau de Parfum de Yves Saint Laurent, da família olfativa floral fougère. A composição abre com lavanda, mandarina, cassis e petitgrain, revela no coração flor de laranjeira, lavanda e jasmim e assenta sobre baunilha de Madagascar, almíscar, cedro e âmbar-cinzento.',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Fougère',
  array['Lavanda', 'Mandarina', 'Cassis', 'Petitgrain']::text[], array['Flor de Laranjeira', 'Lavanda', 'Jasmim']::text[], array['Baunilha de Madagascar', 'Almíscar', 'Cedro', 'Âmbar-cinzento']::text[], null, null,
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'libre'), 'SLY-LIBRE-030', '3614272648401', 30, 47900, 69899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIBRE-030'), 7, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'libre'), 'SLY-LIBRE-050', '3614272648418', 50, 69900, 99899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIBRE-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'libre'), 'SLY-LIBRE-090', '3614272648425', 90, 85446, 119899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIBRE-090'), 17, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'libre'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400238-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum-30ml--1-.jpg', 'Libre — Yves Saint Laurent', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400238-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum-30ml--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'libre'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400239-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum-30ml--2-.jpg', 'Libre — Yves Saint Laurent (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400239-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum-30ml--2-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'libre'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400240-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum--4-.jpg', 'Libre — Yves Saint Laurent (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1400240-800-800/libre-yves-saint-laurent-perfume-feminino-eau-de-parfum--4-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Dior — Miss Dior Parfum
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('miss-dior-parfum',
  (select id from public.brands where slug = 'dior'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Miss Dior Parfum', 'miss-dior-parfum-dior', 'Jasmim radiante sobre madeiras ambaradas, para momentos especiais.', 'Miss Dior Parfum é uma fragrância feminina em versão Parfum de Dior, da família olfativa chipre floral frutado amadeirado. A composição abre com tangerina, revela no coração jasmim e assenta sobre madeiras ambaradas. Sugestão de uso: eventos especiais.',
  'feminino', 'importado', 'Parfum', 'Chipre Floral Frutado Amadeirado',
  array['Tangerina']::text[], array['Jasmim']::text[], array['Madeiras Ambaradas']::text[], null, 'Eventos especiais',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/miss-dior-perfume-feminino-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'SLY-MISS-DIOR-PARFUM-035', '3348901708944', 35, 68900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-MISS-DIOR-PARFUM-035'), 9, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'SLY-MISS-DIOR-PARFUM-050', '3348901708937', 50, 94900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-MISS-DIOR-PARFUM-050'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'SLY-MISS-DIOR-PARFUM-080', '3348901708920', 80, 112900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-MISS-DIOR-PARFUM-080'), 5, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131926-800-800/3348901708944_1.jpg', 'Miss Dior Parfum — Dior', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131926-800-800/3348901708944_1.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131927-800-800/3348901708944_2.jpg', 'Miss Dior Parfum — Dior (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131927-800-800/3348901708944_2.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'miss-dior-parfum'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131928-800-800/3348901708920 -3348901708937_3.jpg', 'Miss Dior Parfum — Dior (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3131928-800-800/3348901708920 -3348901708937_3.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Giorgio Armani — Sì
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('si',
  (select id from public.brands where slug = 'giorgio-armani'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Sì', 'si-giorgio-armani', 'Cassis e rosa em um chipre frutado elegante.', 'Sì é uma fragrância feminina em versão Eau de Parfum de Giorgio Armani, da família olfativa chipre frutado. A composição abre com groselha negra, revela no coração frésia e rosa de Maio e assenta sobre madeira clara almiscarada.',
  'feminino', 'importado', 'Eau de Parfum', 'Chipre Frutado',
  array['Groselha Negra']::text[], array['Frésia', 'Rosa de Maio']::text[], array['Madeira Clara Almiscarada']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/si-eau-de-parfum-giorgio-armani-perfume-feminino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'si'), 'SLY-SI-030', '3605521816511', 30, 45000, 59900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SI-030'), 9, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'si'), 'SLY-SI-050', '3605521816580', 50, 65614, 87900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SI-050'), 5, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'si'), 'SLY-SI-100', '3605521816658', 100, 79600, 109900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SI-100'), 19, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'si'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361387-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--1-.jpg', 'Sì — Giorgio Armani', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361387-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'si'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361388-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--3-.jpg', 'Sì — Giorgio Armani (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361388-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--3-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'si'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361389-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--8-.jpg', 'Sì — Giorgio Armani (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1361389-800-800/si-eau-de-parfum-giorgio-armani-perfume-feminino--8-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Dolce&Gabbana — Light Blue
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('light-blue',
  (select id from public.brands where slug = 'dolce-e-gabbana'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Light Blue', 'light-blue-dolce-e-gabbana', 'Limão siciliano e maçã verde: o frescor do verão mediterrâneo.', 'Light Blue é uma fragrância feminina em versão Eau de Toilette de Dolce&Gabbana. A composição abre com limão siciliano, revela no coração maçã Granny Smith e assenta sobre cedro. Sugestão de uso: dias quentes.',
  'feminino', 'importado', 'Eau de Toilette', null,
  array['Limão Siciliano']::text[], array['Maçã Granny Smith']::text[], array['Cedro']::text[], null, 'Dias quentes',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'light-blue'), 'SLY-LIGHT-BLUE-030', '8057971188178', 30, 37147, 54900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIGHT-BLUE-030'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'light-blue'), 'SLY-LIGHT-BLUE-050', '8057971188185', 50, 49410, 73500, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIGHT-BLUE-050'), 10, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'light-blue'), 'SLY-LIGHT-BLUE-100', '8057971188192', 100, 75619, 97899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIGHT-BLUE-100'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'light-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891080-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--1-.jpg', 'Light Blue — Dolce&Gabbana', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891080-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'light-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891081-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--8-.jpg', 'Light Blue — Dolce&Gabbana (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891081-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--8-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'light-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891082-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--2-.jpg', 'Light Blue — Dolce&Gabbana (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/891082-800-800/light-blue-eau-de-toilette-dolce-gabbana-perfume-feminino--2-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Burberry — Her
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('burberry-her',
  (select id from public.brands where slug = 'burberry'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Her', 'her-burberry', 'Frutas vermelhas suculentas com fundo amadeirado suave.', 'Her é uma fragrância feminina em versão Eau de Parfum de Burberry, da família olfativa gourmand. A composição abre com framboesa, morango, cereja amarga, amora, cassis e limão siciliano, revela no coração jasmim e violeta e assenta sobre âmbar, musgo de carvalho, almíscar, patchouli, baunilha e Cashmeran. Sugestão de uso: trabalho ou lazer.',
  'feminino', 'importado', 'Eau de Parfum', 'Gourmand',
  array['Framboesa', 'Morango', 'Cereja Amarga', 'Amora', 'Cassis', 'Limão Siciliano']::text[], array['Jasmim', 'Violeta']::text[], array['Âmbar', 'Musgo de Carvalho', 'Almíscar', 'Patchouli', 'Baunilha', 'Cashmeran']::text[], null, 'Trabalho ou lazer',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/burberry-her-eau-de-parfum-106177/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'burberry-her'), 'SLY-BURBERRY-HER-030', '3614227693241', 30, 48390, 56990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BURBERRY-HER-030'), 16, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'burberry-her'), 'SLY-BURBERRY-HER-050', '3614227693920', 50, 67890, 74900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BURBERRY-HER-050'), 12, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'burberry-her'), 'SLY-BURBERRY-HER-100', '3614227693876', 100, 87390, 99990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BURBERRY-HER-100'), 4, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'burberry-her'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828552-800-800/17443113816582.jpg', 'Her — Burberry', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828552-800-800/17443113816582.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'burberry-her'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828555-800-800/17443113845709.jpg', 'Her — Burberry (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828555-800-800/17443113845709.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'burberry-her'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828554-800-800/17443113868679.jpg', 'Her — Burberry (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/828554-800-800/17443113868679.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Marc Jacobs — Daisy
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('daisy',
  (select id from public.brands where slug = 'marc-jacobs'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Daisy', 'daisy-marc-jacobs', 'Floral leve e alegre, perfeito para o dia a dia.', 'Daisy é uma fragrância feminina em versão Eau de Toilette de Marc Jacobs, da família olfativa floral. A composição abre com morango, folhas de violeta e grapefruit vermelho, revela no coração gardênia e pétalas de violeta e assenta sobre almíscar, baunilha e madeiras brancas.',
  'feminino', 'importado', 'Eau de Toilette', 'Floral',
  array['Morango', 'Folhas de Violeta', 'Grapefruit Vermelho']::text[], array['Gardênia', 'Pétalas de Violeta']::text[], array['Almíscar', 'Baunilha', 'Madeiras Brancas']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/daisy-eau-de-toilette-marc-jacobs-perfume-feminino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'daisy'), 'SLY-DAISY-050', '0031655513027', 50, 44115, 51900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-DAISY-050'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'daisy'), 'SLY-DAISY-100', '0031655513034', 100, 70900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-DAISY-100'), 15, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'daisy'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403808-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino-50ml--2-.jpg', 'Daisy — Marc Jacobs', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403808-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino-50ml--2-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'daisy'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403809-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino-50ml--1-.jpg', 'Daisy — Marc Jacobs (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403809-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino-50ml--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'daisy'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403810-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino--1-.jpg', 'Daisy — Marc Jacobs (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/403810-800-800/daisy-eau-de-toilette-marc-jacobs-perfume-feminino--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Jean Paul Gaultier — Scandal
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('scandal',
  (select id from public.brands where slug = 'jean-paul-gaultier'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Scandal', 'scandal-jean-paul-gaultier', 'Gourmand cremoso com coração intenso de mel.', 'Scandal é uma fragrância feminina em versão Eau de Parfum de Jean Paul Gaultier, da família olfativa chipre gourmand. Entre os ingredientes em destaque estão mel. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'importado', 'Eau de Parfum', 'Chipre Gourmand',
  null, null, null, array['Mel']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/scandal-jean-paul-gaultier-eau-de-parfum-feminino-30-ml-240113/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'scandal'), 'SLY-SCANDAL-030', '8435415018463', 30, 40600, 48720, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SCANDAL-030'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'scandal'), 'SLY-SCANDAL-050', '8435415059077', 50, 56400, 67680, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SCANDAL-050'), 17, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'scandal'), 'SLY-SCANDAL-080', '8435415059060', 80, 65700, 78840, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SCANDAL-080'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'scandal'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2322131-800-800/17805105429059.jpg', 'Scandal — Jean Paul Gaultier', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2322131-800-800/17805105429059.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'scandal'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2322101-800-800/17805105447090.jpg', 'Scandal — Jean Paul Gaultier (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2322101-800-800/17805105447090.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'scandal'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2249989-800-800/17799012211550.jpg', 'Scandal — Jean Paul Gaultier (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2249989-800-800/17799012211550.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Carolina Herrera — 212 VIP Rosé
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('212-vip-rose',
  (select id from public.brands where slug = 'carolina-herrera'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  '212 VIP Rosé', '212-vip-rose-carolina-herrera', 'Champagne e flor de pêssego para noites de festa.', '212 VIP Rosé é uma fragrância feminina em versão Eau de Parfum de Carolina Herrera, da família olfativa floral frutal. A composição abre com notas frutadas e champagne, revela no coração flor de pêssego e assenta sobre notas amadeiradas, âmbar e almíscar branco. Sugestão de uso: noite.',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Frutal',
  array['Notas Frutadas', 'Champagne']::text[], array['Flor de Pêssego']::text[], array['Notas Amadeiradas', 'Âmbar', 'Almíscar Branco']::text[], null, 'Noite',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-212-vip-rose-edp-feminino-30ml-269518/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '212-vip-rose'), 'SLY-212-VIP-ROSE-030', '8411061120583', 30, 52999, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-212-VIP-ROSE-030'), 6, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '212-vip-rose'), 'SLY-212-VIP-ROSE-125', '8411061838778', 125, 93999, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-212-VIP-ROSE-125'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-rose'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922528-800-800/17865581716325.jpg', '212 VIP Rosé — Carolina Herrera', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922528-800-800/17865581716325.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-rose'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922527-800-800/17865581731761.jpg', '212 VIP Rosé — Carolina Herrera (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922527-800-800/17865581731761.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-rose'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922536-800-800/17865581748728.jpg', '212 VIP Rosé — Carolina Herrera (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2922536-800-800/17865581748728.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Lattafa — Yara
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('yara',
  (select id from public.brands where slug = 'lattafa'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Yara', 'yara-lattafa', 'Baunilha cremosa e frutas tropicais, um árabe doce e envolvente.', 'Yara é uma fragrância feminina em versão Eau de Parfum de Lattafa, da família olfativa âmbar baunilha. A composição abre com heliotrópio, orquídea e tangerina, revela no coração acorde gourmand e frutas tropicais e assenta sobre baunilha, almíscar e sândalo.',
  'feminino', 'importado', 'Eau de Parfum', 'Âmbar Baunilha',
  array['Heliotrópio', 'Orquídea', 'Tangerina']::text[], array['Acorde Gourmand', 'Frutas Tropicais']::text[], array['Baunilha', 'Almíscar', 'Sândalo']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/yara-lattafa-eau-de-parfum-feminino-164510/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'yara'), 'SLY-YARA-100', '6291108730515', 100, 28220, 48000, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-YARA-100'), 18, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'yara'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194389-800-800/17619467354822.jpg', 'Yara — Lattafa', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194389-800-800/17619467354822.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'yara'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194387-800-800/17619467352259.jpg', 'Yara — Lattafa (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1194387-800-800/17619467352259.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Valentino — Born in Roma Donna
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('born-in-roma-donna',
  (select id from public.brands where slug = 'valentino'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Born in Roma Donna', 'born-in-roma-donna-valentino', 'Jasmim e baunilha bourbon com um toque amadeirado ousado.', 'Born in Roma Donna é uma fragrância feminina em versão Eau de Parfum de Valentino, da família olfativa floral amadeirado. Entre os ingredientes em destaque estão jasmim, baunilha Bourbon e Cashmeran. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Amadeirado',
  null, null, null, array['Jasmim', 'Baunilha Bourbon', 'Cashmeran']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-valentino-born-in-roma-donna-feminino-eau-de-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'SLY-BORN-IN-ROMA-DONNA-030', '3614272761421', 30, 54550, 66900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-DONNA-030'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'SLY-BORN-IN-ROMA-DONNA-050', '3614272761438', 50, 78787, 97900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-DONNA-050'), 19, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'SLY-BORN-IN-ROMA-DONNA-100', '3614272761445', 100, 96425, 118900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-DONNA-100'), 11, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186833-800-800/3614272761421.01.jpg', 'Born in Roma Donna — Valentino', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186833-800-800/3614272761421.01.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186834-800-800/3614272761421.02.jpg', 'Born in Roma Donna — Valentino (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186834-800-800/3614272761421.02.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-donna'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186835-800-800/3614272761445-3614272761421-3614272761438.03.jpg', 'Born in Roma Donna — Valentino (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186835-800-800/3614272761445-3614272761421-3614272761438.03.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Dolce&Gabbana — The One
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('the-one-dg',
  (select id from public.brands where slug = 'dolce-e-gabbana'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'The One', 'the-one-dolce-e-gabbana', 'Floral oriental caloroso para encontros à noite.', 'The One é uma fragrância feminina em versão Eau de Parfum de Dolce&Gabbana, da família olfativa floral oriental. A composição abre com pêssego, lichia, mandarina e bergamota, revela no coração lírio, ameixa, jasmim e lírio-do-vale e assenta sobre baunilha, âmbar, almíscar e vetiver. Sugestão de uso: noite.',
  'feminino', 'importado', 'Eau de Parfum', 'Floral Oriental',
  array['Pêssego', 'Lichia', 'Mandarina', 'Bergamota']::text[], array['Lírio', 'Ameixa', 'Jasmim', 'Lírio-do-vale']::text[], array['Baunilha', 'Âmbar', 'Almíscar', 'Vetiver']::text[], null, 'Noite',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/the-one-by-dolce-gabbana-eau-de-parfum-feminino-178745/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'the-one-dg'), 'SLY-THE-ONE-DG-030', '0737052020815', 30, 48970, 59800, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-THE-ONE-DG-030'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'the-one-dg'), 'SLY-THE-ONE-DG-075', '3423473021001', 75, 82917, 115000, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-THE-ONE-DG-075'), 10, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'the-one-dg'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322659-800-800/17634829077162.jpg', 'The One — Dolce&Gabbana', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322659-800-800/17634829077162.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'the-one-dg'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322662-800-800/17634829069343.jpg', 'The One — Dolce&Gabbana (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322662-800-800/17634829069343.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'the-one-dg'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322710-800-800/17634829071745.jpg', 'The One — Dolce&Gabbana (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1322710-800-800/17634829071745.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Floratta Red Passion
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('floratta-red-passion',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Floratta Red Passion', 'floratta-red-passion-o-boticario', 'Versão intensa de Floratta Red com frutas vermelhas e flores brancas.', 'Floratta Red Passion é uma fragrância feminina em versão Eau de Parfum de O Boticário. Entre os ingredientes em destaque estão pera, mandarina, frutas vermelhas, gardênia, jasmim, baunilha e licor de maçã. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'nacional', 'Eau de Parfum', null,
  null, null, null, array['Pera', 'Mandarina', 'Frutas Vermelhas', 'Gardênia', 'Jasmim', 'Baunilha', 'Licor de Maçã']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/floratta-red-passion-eau-de-parfum-75ml-241814/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'floratta-red-passion'), 'SLY-FLORATTA-RED-PASSION-075', '7891033593064', 75, 36990, 42900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-FLORATTA-RED-PASSION-075'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-red-passion'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357086-800-800/17806630849901.jpg', 'Floratta Red Passion — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357086-800-800/17806630849901.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-red-passion'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357080-800-800/17806630856165.jpg', 'Floratta Red Passion — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357080-800-800/17806630856165.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-red-passion'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357085-800-800/17806630862468.jpg', 'Floratta Red Passion — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357085-800-800/17806630862468.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Floratta Rose Sucrée
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('floratta-rose-sucree',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Floratta Rose Sucrée', 'floratta-rose-sucree-o-boticario', 'Rosas açucaradas inspiradas na confeitaria parisiense.', 'Floratta Rose Sucrée é uma fragrância feminina em versão Eau de Parfum de O Boticário. Entre os ingredientes em destaque estão rosa Damascena, gardênia, framboesa, lichia e água de rosas. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'nacional', 'Eau de Parfum', null,
  null, null, null, array['Rosa Damascena', 'Gardênia', 'Framboesa', 'Lichia', 'Água de Rosas']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/floratta-rose-sucree-eau-de-parfum-75ml-|-o-boticario-241811/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'floratta-rose-sucree'), 'SLY-FLORATTA-ROSE-SUCREE-075', '7891033519804', 75, 33210, 46990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-FLORATTA-ROSE-SUCREE-075'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-rose-sucree'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357056-800-800/17799811671721.jpg', 'Floratta Rose Sucrée — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357056-800-800/17799811671721.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-rose-sucree'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357057-800-800/17799811697801.jpg', 'Floratta Rose Sucrée — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357057-800-800/17799811697801.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'floratta-rose-sucree'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357083-800-800/17799811706100.jpg', 'Floratta Rose Sucrée — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2357083-800-800/17799811706100.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Dior — Sauvage
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('sauvage-edt',
  (select id from public.brands where slug = 'dior'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Sauvage', 'sauvage-dior', 'Bergamota vibrante e ambroxan: fresco, intenso e duradouro.', 'Sauvage é uma fragrância masculina em versão Eau de Toilette de Dior, da família olfativa aromático cítrico amadeirado. A composição abre com bergamota da Calábria, revela no coração pimenta de Sichuan, lavanda e elemi e assenta sobre ambroxan e notas amadeiradas secas.',
  'masculino', 'importado', 'Eau de Toilette', 'Aromático Cítrico Amadeirado',
  array['Bergamota da Calábria']::text[], array['Pimenta de Sichuan', 'Lavanda', 'Elemi']::text[], array['Ambroxan', 'Notas Amadeiradas Secas']::text[], null, null,
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/sauvage-eau-de-toilette-dior-perfume-masculino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'SLY-SAUVAGE-EDT-030', '3348901520195', 30, 63500, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SAUVAGE-EDT-030'), 17, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'SLY-SAUVAGE-EDT-060', '3348901250153', 60, 72900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SAUVAGE-EDT-060'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'SLY-SAUVAGE-EDT-100', '3348901250146', 100, 86900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SAUVAGE-EDT-100'), 5, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'SLY-SAUVAGE-EDT-200', '3348901321129', 200, 126900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-SAUVAGE-EDT-200'), 20, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304276-800-800/3348901250146_1.jpg', 'Sauvage — Dior', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304276-800-800/3348901250146_1.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304277-800-800/3348901250146-3348901250153-3348901321129_2-3348901520195_3.jpg', 'Sauvage — Dior (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304277-800-800/3348901250146-3348901250153-3348901321129_2-3348901520195_3.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'sauvage-edt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304278-800-800/3348901250146-3348901250153-3348901321129_3-3348901520195_4.jpg', 'Sauvage — Dior (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3304278-800-800/3348901250146-3348901250153-3348901321129_3-3348901520195_4.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Rabanne — 1 Million
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('1-million',
  (select id from public.brands where slug = 'rabanne'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  '1 Million', '1-million-rabanne', 'Especiado e quente, com canela, couro e âmbar.', '1 Million é uma fragrância masculina em versão Eau de Toilette de Rabanne, da família olfativa amadeirado especiado. A composição abre com mandarina sanguínea, grapefruit e hortelã, revela no coração canela, notas especiadas e rosa e assenta sobre âmbar, couro, notas amadeiradas e patchouli. Sugestão de uso: noite e eventos especiais.',
  'masculino', 'importado', 'Eau de Toilette', 'Amadeirado Especiado',
  array['Mandarina Sanguínea', 'Grapefruit', 'Hortelã']::text[], array['Canela', 'Notas Especiadas', 'Rosa']::text[], array['Âmbar', 'Couro', 'Notas Amadeiradas', 'Patchouli']::text[], null, 'Noite e eventos especiais',
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/rabanne-1-million-eau-de-toilette---perfume-masculino-323995/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '1-million'), 'SLY-1-MILLION-050', '3349668612598', 50, 55800, 64900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-1-MILLION-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '1-million'), 'SLY-1-MILLION-100', '3349666007921', 100, 70600, 84900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-1-MILLION-100'), 25, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '1-million'), 'SLY-1-MILLION-200', '3349668566372', 200, 93700, 118900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-1-MILLION-200'), 18, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '1-million'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930022-800-800/17937775646812.jpg', '1 Million — Rabanne', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930022-800-800/17937775646812.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '1-million'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930047-800-800/17937775706038.jpg', '1 Million — Rabanne (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930047-800-800/17937775706038.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '1-million'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930050-800-800/17937775735347.jpg', '1 Million — Rabanne (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3930050-800-800/17937775735347.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Rabanne — Invictus
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('invictus',
  (select id from public.brands where slug = 'rabanne'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Invictus', 'invictus-rabanne', 'Aquático e energizante, ideal para o dia a dia e dias quentes.', 'Invictus é uma fragrância masculina em versão Eau de Toilette de Rabanne, da família olfativa aquático amadeirado. A composição abre com toranja, notas marinhas e mandarina, revela no coração folha de louro e jasmim e assenta sobre madeira guaiac, patchouli, âmbar-cinzento e musgo de carvalho. Sugestão de uso: uso diário.',
  'masculino', 'importado', 'Eau de Toilette', 'Aquático Amadeirado',
  array['Toranja', 'Notas Marinhas', 'Mandarina']::text[], array['Folha de Louro', 'Jasmim']::text[], array['Madeira Guaiac', 'Patchouli', 'Âmbar-cinzento', 'Musgo de Carvalho']::text[], null, 'Uso diário',
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/rabanne-invictus-eau-de-toilette---perfume-masculino-324291/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'invictus'), 'SLY-INVICTUS-050', '3349668515653', 50, 56000, 71900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-INVICTUS-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'invictus'), 'SLY-INVICTUS-100', '3349668515660', 100, 70700, 84900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-INVICTUS-100'), 18, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'invictus'), 'SLY-INVICTUS-200', '3349668589678', 200, 71000, 102900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-INVICTUS-200'), 11, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'invictus'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933260-800-800/17937776672891.jpg', 'Invictus — Rabanne', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933260-800-800/17937776672891.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'invictus'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933319-800-800/17937776751358.jpg', 'Invictus — Rabanne (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933319-800-800/17937776751358.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'invictus'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933356-800-800/17937776801044.jpg', 'Invictus — Rabanne (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3933356-800-800/17937776801044.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Giorgio Armani — Acqua di Giò
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('acqua-di-gio-edp',
  (select id from public.brands where slug = 'giorgio-armani'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Acqua di Giò', 'acqua-di-gio-giorgio-armani', 'Frescor marinho clássico em frasco refilável.', 'Acqua di Giò é uma fragrância masculina em versão Eau de Parfum de Giorgio Armani, da família olfativa aquático floral. A composição abre com jasmim e Hedione, revela no coração acorde marinho e assenta sobre cedro, almíscar e patchouli.',
  'masculino', 'importado', 'Eau de Parfum', 'Aquático Floral',
  array['Jasmim', 'Hedione']::text[], array['Acorde Marinho']::text[], array['Cedro', 'Almíscar', 'Patchouli']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-040', '3614273662499', 40, 49900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-040'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-050', '3614273955416', 50, 60552, 69900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-050'), 8, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-075', '3614273662475', 75, 67900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-075'), 9, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-100', '3614273954341', 100, 73900, 89899, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-100'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-125', '3614273662420', 125, 84900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-125'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'SLY-ACQUA-DI-GIO-EDP-200', '3614273954297', 200, 129900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ACQUA-DI-GIO-EDP-200'), 15, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612436-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--8-.jpg', 'Acqua di Giò — Giorgio Armani', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612436-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--8-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612437-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--7-.jpg', 'Acqua di Giò — Giorgio Armani (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612437-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--7-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'acqua-di-gio-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612438-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--3-.jpg', 'Acqua di Giò — Giorgio Armani (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/612438-800-800/acqua-di-gio-refilavel-giorgio-armani-perfume-masculino-eau-de-parfum--3-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Azzaro — Wanted
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('wanted',
  (select id from public.brands where slug = 'azzaro'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Wanted', 'wanted-azzaro', 'Limão e gengibre sobre vetiver: magnético e versátil.', 'Wanted é uma fragrância masculina em versão Eau de Toilette de Azzaro, da família olfativa aromático especiado amadeirado. A composição abre com limão siciliano e gengibre, revela no coração cardamomo e zimbro e assenta sobre vetiver e fava tonka.',
  'masculino', 'importado', 'Eau de Toilette', 'Aromático Especiado Amadeirado',
  array['Limão Siciliano', 'Gengibre']::text[], array['Cardamomo', 'Zimbro']::text[], array['Vetiver', 'Fava Tonka']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/wanted-eau-de-toillete-azzaro-perfume-masculino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'wanted'), 'SLY-WANTED-050', '3351500002696', 50, 55249, 61900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-WANTED-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'wanted'), 'SLY-WANTED-100', '3351500016617', 100, 62898, 80900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-WANTED-100'), 10, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'wanted'), 'SLY-WANTED-150', '3351500016662', 150, 99900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-WANTED-150'), 11, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wanted'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186525-800-800/3351500016617.01.jpg', 'Wanted — Azzaro', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186525-800-800/3351500016617.01.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wanted'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186526-800-800/3351500016617.02.jpg', 'Wanted — Azzaro (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186526-800-800/3351500016617.02.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wanted'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186527-800-800/3351500016617.03-3351500016600.03.jpg', 'Wanted — Azzaro (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3186527-800-800/3351500016617.03-3351500016600.03.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Jean Paul Gaultier — Le Male
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('le-male',
  (select id from public.brands where slug = 'jean-paul-gaultier'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Le Male', 'le-male-jean-paul-gaultier', 'Clássico de menta, lavanda e baunilha.', 'Le Male é uma fragrância masculina em versão Eau de Toilette de Jean Paul Gaultier, da família olfativa fougère oriental. A composição abre com menta, artemísia, cardamomo e bergamota, revela no coração lavanda, flor de laranjeira, canela e cominho e assenta sobre sândalo, baunilha, cedro, fava tonka e âmbar.',
  'masculino', 'importado', 'Eau de Toilette', 'Fougère Oriental',
  array['Menta', 'Artemísia', 'Cardamomo', 'Bergamota']::text[], array['Lavanda', 'Flor de Laranjeira', 'Canela', 'Cominho']::text[], array['Sândalo', 'Baunilha', 'Cedro', 'Fava Tonka', 'Âmbar']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/le-male-eau-de-toilette-jean-paul-gaultier-perfume-masculino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'le-male'), 'SLY-LE-MALE-040', '8435415111973', 40, 35891, 42900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LE-MALE-040'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'le-male'), 'SLY-LE-MALE-075', '8435415012638', 75, 51900, 63900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LE-MALE-075'), 11, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'le-male'), 'SLY-LE-MALE-125', '8435415012669', 125, 77900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LE-MALE-125'), 25, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'le-male'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499165-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--8-.jpg', 'Le Male — Jean Paul Gaultier', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499165-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--8-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'le-male'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499166-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--9-.jpg', 'Le Male — Jean Paul Gaultier (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499166-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--9-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'le-male'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499167-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--10-.jpg', 'Le Male — Jean Paul Gaultier (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/499167-800-800/Le-Male-Eau-De-Toilette-Jean-Paul-Gaultier---Perfume-Masculino--10-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Montblanc — Explorer
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('explorer',
  (select id from public.brands where slug = 'montblanc'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Explorer', 'explorer-montblanc', 'Bergamota, vetiver e patchouli com elegância casual.', 'Explorer é uma fragrância masculina em versão Eau de Parfum de Montblanc. Entre os ingredientes em destaque estão bergamota, vetiver e patchouli. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'masculino', 'importado', 'Eau de Parfum', null,
  null, null, null, array['Bergamota', 'Vetiver', 'Patchouli']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/explorer-montblanc-perfume-masculino-eau-de-parfum/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'explorer'), 'SLY-EXPLORER-030', '3386460101059', 30, 44963, 54900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EXPLORER-030'), 10, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'explorer'), 'SLY-EXPLORER-060', '3386460101042', 60, 64969, 75900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EXPLORER-060'), 15, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'explorer'), 'SLY-EXPLORER-100', '3386460101035', 100, 72601, 94399, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EXPLORER-100'), 0, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'explorer'), 'SLY-EXPLORER-200', '3386460118675', 200, 64857, 119900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EXPLORER-200'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'explorer'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737407-800-800/3386460101035.1.jpg.jpg', 'Explorer — Montblanc', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737407-800-800/3386460101035.1.jpg.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'explorer'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737408-800-800/3386460101035.2.jpg.jpg', 'Explorer — Montblanc (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737408-800-800/3386460101035.2.jpg.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'explorer'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737409-800-800/3386460101035.3.jpg.jpg', 'Explorer — Montblanc (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/737409-800-800/3386460101035.3.jpg.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Versace — Eros
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('eros',
  (select id from public.brands where slug = 'versace'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Eros', 'eros-versace', 'Menta e baunilha, intenso e sedutor para a noite.', 'Eros é uma fragrância masculina em versão Eau de Toilette de Versace, da família olfativa aromático amadeirado. A composição abre com menta, limão e maçã verde, revela no coração fava tonka, ambroxan e gerânio e assenta sobre baunilha de Madagascar e vetiver. Sugestão de uso: noite.',
  'masculino', 'importado', 'Eau de Toilette', 'Aromático Amadeirado',
  array['Menta', 'Limão', 'Maçã Verde']::text[], array['Fava Tonka', 'Ambroxan', 'Gerânio']::text[], array['Baunilha de Madagascar', 'Vetiver']::text[], null, 'Noite',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/eros-versace-edt-masculino-30ml-233464/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'eros'), 'SLY-EROS-030', '8011003809196', 30, 43900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EROS-030'), 4, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'eros'), 'SLY-EROS-100', '8011003809219', 100, 73900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EROS-100'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'eros'), 'SLY-EROS-200', '8011003813858', 200, 72400, 86880, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EROS-200'), 7, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'eros'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2199950-800-800/17794747785073.jpg', 'Eros — Versace', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2199950-800-800/17794747785073.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'eros'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2200029-800-800/17794747797542.jpg', 'Eros — Versace (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2200029-800-800/17794747797542.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'eros'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2200036-800-800/17794747811887.jpg', 'Eros — Versace (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2200036-800-800/17794747811887.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Carolina Herrera — 212 VIP Men
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('212-vip-men',
  (select id from public.brands where slug = 'carolina-herrera'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  '212 VIP Men', '212-vip-men-carolina-herrera', 'Vodka gelada e gengibre para noites de festa.', '212 VIP Men é uma fragrância masculina em versão Eau de Toilette de Carolina Herrera, da família olfativa amadeirado oriental. A composição abre com lima caviar, hortelã e pimenta preta, revela no coração acorde de vodka, gengibre e maçã e assenta sobre fava tonka, âmbar e madeiras. Sugestão de uso: noite.',
  'masculino', 'importado', 'Eau de Toilette', 'Amadeirado Oriental',
  array['Lima Caviar', 'Hortelã', 'Pimenta Preta']::text[], array['Acorde de Vodka', 'Gengibre', 'Maçã']::text[], array['Fava Tonka', 'Âmbar', 'Madeiras']::text[], null, 'Noite',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/212-vip-men-eau-de-toilette-carolina-herrera-perfume-masculino/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '212-vip-men'), 'SLY-212-VIP-MEN-050', '8411061869253', 50, 59900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-212-VIP-MEN-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '212-vip-men'), 'SLY-212-VIP-MEN-100', '8411061088166', 100, 48400, 73900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-212-VIP-MEN-100'), 23, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = '212-vip-men'), 'SLY-212-VIP-MEN-200', '8411061782347', 200, 83711, 102900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-212-VIP-MEN-200'), 16, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-men'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485820-800-800/212-vip-men-carolina-hererra-50ml--1-.jpg', '212 VIP Men — Carolina Herrera', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485820-800-800/212-vip-men-carolina-hererra-50ml--1-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-men'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485821-800-800/212-vip-men-carolina-hererra-50ml--2-.jpg', '212 VIP Men — Carolina Herrera (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485821-800-800/212-vip-men-carolina-hererra-50ml--2-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = '212-vip-men'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485822-800-800/212-vip-men-carolina-hererra-50ml--3-.jpg', '212 VIP Men — Carolina Herrera (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/485822-800-800/212-vip-men-carolina-hererra-50ml--3-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Carolina Herrera — Bad Boy
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('bad-boy',
  (select id from public.brands where slug = 'carolina-herrera'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Bad Boy', 'bad-boy-carolina-herrera', 'Contraste entre pimentas luminosas e cacau com fava tonka.', 'Bad Boy é uma fragrância masculina em versão Eau de Toilette de Carolina Herrera, da família olfativa oriental amadeirado. Entre os ingredientes em destaque estão sálvia, pimenta preta, pimenta branca, bergamota, fava tonka, cacau e âmbar. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'masculino', 'importado', 'Eau de Toilette', 'Oriental Amadeirado',
  null, null, null, array['Sálvia', 'Pimenta Preta', 'Pimenta Branca', 'Bergamota', 'Fava Tonka', 'Cacau', 'Âmbar']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/bad-boy-carolina-herrera-masculino-eau-de-toilette-100ml-283140/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'bad-boy'), 'SLY-BAD-BOY-100', '8411061923245', 100, 74900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BAD-BOY-100'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'bad-boy'), 'SLY-BAD-BOY-150', '8411061063392', 150, 88900, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BAD-BOY-150'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'bad-boy'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3116988-800-800/17882696519533.jpg', 'Bad Boy — Carolina Herrera', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3116988-800-800/17882696519533.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'bad-boy'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3116985-800-800/17882696905292.jpg', 'Bad Boy — Carolina Herrera (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3116985-800-800/17882696905292.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Ralph Lauren — Polo Blue Parfum
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('polo-blue-parfum',
  (select id from public.brands where slug = 'ralph-lauren'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Polo Blue Parfum', 'polo-blue-parfum-ralph-lauren', 'Frescor aquático com profundidade amadeirada.', 'Polo Blue Parfum é uma fragrância masculina em versão Parfum de Ralph Lauren, da família olfativa aquático. A composição abre com mandarina, cardamomo e pimenta rosa, revela no coração vetiver, sálvia esclareia, lavanda e jasmim e assenta sobre madeira de carvalho, olíbano e patchouli.',
  'masculino', 'importado', 'Parfum', 'Aquático',
  array['Mandarina', 'Cardamomo', 'Pimenta Rosa']::text[], array['Vetiver', 'Sálvia Esclareia', 'Lavanda', 'Jasmim']::text[], array['Madeira de Carvalho', 'Olíbano', 'Patchouli']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/polo-blue-parfum-de-ralph-lauren-masculino-264134/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'polo-blue-parfum'), 'SLY-POLO-BLUE-PARFUM-125', '3605972696984', 125, 65404, 81000, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-POLO-BLUE-PARFUM-125'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'polo-blue-parfum'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2833481-800-800/17619503554307.jpg', 'Polo Blue Parfum — Ralph Lauren', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2833481-800-800/17619503554307.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'polo-blue-parfum'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2833476-800-800/17619503552362.jpg', 'Polo Blue Parfum — Ralph Lauren (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2833476-800-800/17619503552362.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Hugo Boss — Boss Bottled
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('boss-bottled',
  (select id from public.brands where slug = 'hugo-boss'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Boss Bottled', 'boss-bottled-hugo-boss', 'Amadeirado clássico e elegante para o dia a dia.', 'Boss Bottled é uma fragrância masculina em versão Eau de Toilette de Hugo Boss, da família olfativa amadeirado. A pirâmide olfativa ainda não foi confirmada por fonte confiável.',
  'masculino', 'importado', 'Eau de Toilette', 'Amadeirado',
  null, null, null, null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/boss-bottled-edt-30ml-300283/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'boss-bottled'), 'SLY-BOSS-BOTTLED-030', '737052351001', 30, 26990, 44990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BOSS-BOTTLED-030'), 7, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'boss-bottled'), 'SLY-BOSS-BOTTLED-050', '737052351018', 50, 34490, 59990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BOSS-BOTTLED-050'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'boss-bottled'), 'SLY-BOSS-BOTTLED-100', '737052351100', 100, 69990, 79990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BOSS-BOTTLED-100'), 17, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'boss-bottled'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3309264-800-800/17912971022595.jpg', 'Boss Bottled — Hugo Boss', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3309264-800-800/17912971022595.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'boss-bottled'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3305873-800-800/17908931007123.jpg', 'Boss Bottled — Hugo Boss (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3305873-800-800/17908931007123.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'boss-bottled'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2189420-800-800/17797209945318.jpg', 'Boss Bottled — Hugo Boss (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2189420-800-800/17797209945318.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Valentino — Born in Roma Uomo
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('born-in-roma-uomo',
  (select id from public.brands where slug = 'valentino'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Born in Roma Uomo', 'born-in-roma-uomo-valentino', 'Violeta, sálvia e vetiver defumado em assinatura moderna.', 'Born in Roma Uomo é uma fragrância masculina em versão Eau de Toilette de Valentino, da família olfativa aromático amadeirado. Entre os ingredientes em destaque estão violeta, sal mineral, gengibre, sálvia e vetiver defumado. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'masculino', 'importado', 'Eau de Toilette', 'Aromático Amadeirado',
  null, null, null, array['Violeta', 'Sal Mineral', 'Gengibre', 'Sálvia', 'Vetiver Defumado']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-valentino-born-in-roma-uomo-masculino-eau-de-tolitte/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'SLY-BORN-IN-ROMA-UOMO-050', '3614272761452', 50, 48363, 78900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-UOMO-050'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'SLY-BORN-IN-ROMA-UOMO-100', '3614272761469', 100, 69674, 91900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-UOMO-100'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'SLY-BORN-IN-ROMA-UOMO-150', '3614273582612', 150, 81866, 107900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-BORN-IN-ROMA-UOMO-150'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189688-800-800/3614272761469.01.jpg', 'Born in Roma Uomo — Valentino', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189688-800-800/3614272761469.01.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189689-800-800/3614272761469.02.jpg', 'Born in Roma Uomo — Valentino (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189689-800-800/3614272761469.02.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'born-in-roma-uomo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189690-800-800/3614272761469.03-3614273582612.03-3614272761452.03.jpg', 'Born in Roma Uomo — Valentino (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3189690-800-800/3614272761469.03-3614273582612.03-3614272761452.03.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Armaf — Club de Nuit Intense Man
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('club-de-nuit-intense',
  (select id from public.brands where slug = 'armaf'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Club de Nuit Intense Man', 'club-de-nuit-intense-man-armaf', 'Abacaxi e bétula defumada, intenso e duradouro.', 'Club de Nuit Intense Man é uma fragrância masculina em versão Eau de Toilette de Armaf. A composição abre com limão, maçã, bergamota, groselha preta e abacaxi, revela no coração rosa, jasmim e bétula e assenta sobre almíscar, âmbar-cinzento, patchouli e baunilha.',
  'masculino', 'importado', 'Eau de Toilette', null,
  array['Limão', 'Maçã', 'Bergamota', 'Groselha Preta', 'Abacaxi']::text[], array['Rosa', 'Jasmim', 'Bétula']::text[], array['Almíscar', 'Âmbar-cinzento', 'Patchouli', 'Baunilha']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/club-de-nuit-intense-man-armaf-eau-de-toilette-105-ml-238917/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'club-de-nuit-intense'), 'SLY-CLUB-DE-NUIT-INTENSE-105', '6085010044712', 105, 32800, 39360, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CLUB-DE-NUIT-INTENSE-105'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'club-de-nuit-intense'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282135-800-800/17799928218796.jpg', 'Club de Nuit Intense Man — Armaf', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282135-800-800/17799928218796.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'club-de-nuit-intense'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282139-800-800/17799928238170.jpg', 'Club de Nuit Intense Man — Armaf (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282139-800-800/17799928238170.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'club-de-nuit-intense'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282145-800-800/17799928256451.jpg', 'Club de Nuit Intense Man — Armaf (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2282145-800-800/17799928256451.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Lattafa — Asad
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('asad',
  (select id from public.brands where slug = 'lattafa'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Asad', 'asad-lattafa', 'Pimenta, café e baunilha num ambarado potente.', 'Asad é uma fragrância masculina em versão Eau de Parfum de Lattafa, da família olfativa ambarado oriental. A composição abre com pimenta-do-reino e abacaxi, revela no coração café, íris e patchouli e assenta sobre âmbar, baunilha, madeiras secas, benjoim e ládano.',
  'masculino', 'importado', 'Eau de Parfum', 'Ambarado Oriental',
  array['Pimenta-do-reino', 'Abacaxi']::text[], array['Café', 'Íris', 'Patchouli']::text[], array['Âmbar', 'Baunilha', 'Madeiras Secas', 'Benjoim', 'Ládano']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/asad-lattafa-perfume-masculino-edp-100ml-263955/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'asad'), 'SLY-ASAD-100', '6291108735411', 100, 25990, 31990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ASAD-100'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'asad'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2826136-800-800/17835904175183.jpg', 'Asad — Lattafa', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2826136-800-800/17835904175183.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Versace — Dylan Blue Pour Homme
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('dylan-blue',
  (select id from public.brands where slug = 'versace'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Dylan Blue Pour Homme', 'dylan-blue-pour-homme-versace', 'Fragrância masculina da linha Dylan Blue.', 'Dylan Blue Pour Homme é uma fragrância masculina em versão Eau de Toilette de Versace. A pirâmide olfativa ainda não foi confirmada por fonte confiável.',
  'masculino', 'importado', 'Eau de Toilette', null,
  null, null, null, null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-masculino-pour-homme-dylan-blue-versace-50-ml-eau-de-toilette-261515/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'dylan-blue'), 'SLY-DYLAN-BLUE-050', '8011003825738', 50, 68408, 76009, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-DYLAN-BLUE-050'), 6, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'dylan-blue'), 'SLY-DYLAN-BLUE-200', '8011003826490', 200, 105653, 137349, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-DYLAN-BLUE-200'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'dylan-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2770304-800-800/17843223730381.jpg', 'Dylan Blue Pour Homme — Versace', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2770304-800-800/17843223730381.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'dylan-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3537572-800-800/17922343629312.jpg', 'Dylan Blue Pour Homme — Versace (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3537572-800-800/17922343629312.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'dylan-blue'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3537408-800-800/17922343650593.jpg', 'Dylan Blue Pour Homme — Versace (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3537408-800-800/17922343650593.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Calvin Klein — CK One
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('ck-one',
  (select id from public.brands where slug = 'calvin-klein'),
  (select id from public.categories where slug = 'perfumes-unissex'),
  'CK One', 'ck-one-calvin-klein', 'Cítrico leve e compartilhável para dias quentes.', 'CK One é uma fragrância unissex em versão Eau de Toilette de Calvin Klein, da família olfativa aromático cítrico. A composição abre com bergamota, cardamomo, tangerina, frésia e lavanda, revela no coração chá verde, violeta, rosa e flor de laranjeira e assenta sobre âmbar e almíscar. Sugestão de uso: dia a dia.',
  'unissex', 'importado', 'Eau de Toilette', 'Aromático Cítrico',
  array['Bergamota', 'Cardamomo', 'Tangerina', 'Frésia', 'Lavanda']::text[], array['Chá Verde', 'Violeta', 'Rosa', 'Flor de Laranjeira']::text[], array['Âmbar', 'Almíscar']::text[], null, 'Dia a dia',
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-ck-one-eau-de-toilette-100ml-284491/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'ck-one'), 'SLY-CK-ONE-100', '088300107407', 100, 44195, null, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CK-ONE-100'), 6, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'ck-one'), 'SLY-CK-ONE-200', '3607343811798', 200, 33900, 39900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-CK-ONE-200'), 21, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'ck-one'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126824-800-800/17890492596579.jpg', 'CK One — Calvin Klein', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126824-800-800/17890492596579.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'ck-one'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126829-800-800/17890492616209.jpg', 'CK One — Calvin Klein (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126829-800-800/17890492616209.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'ck-one'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126834-800-800/17890492639544.jpg', 'CK One — Calvin Klein (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3126834-800-800/17890492639544.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Jo Malone London — Wood Sage & Sea Salt
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('wood-sage-sea-salt',
  (select id from public.brands where slug = 'jo-malone-london'),
  (select id from public.categories where slug = 'perfumes-unissex'),
  'Wood Sage & Sea Salt', 'wood-sage-e-sea-salt-jo-malone-london', 'Sálvia e sal marinho: a brisa do litoral inglês.', 'Wood Sage & Sea Salt é uma fragrância unissex em versão Cologne de Jo Malone London, da família olfativa amadeirado fresco. Entre os ingredientes em destaque estão sálvia e sal marinho. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'unissex', 'importado', 'Cologne', 'Amadeirado Fresco',
  null, null, null, array['Sálvia', 'Sal Marinho']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'wood-sage-sea-salt'), 'SLY-WOOD-SAGE-SEA-SALT-030', '0690251182053', 30, 54500, 72500, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-WOOD-SAGE-SEA-SALT-030'), 2, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'wood-sage-sea-salt'), 'SLY-WOOD-SAGE-SEA-SALT-100', '0690251179978', 100, 126234, 147500, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-WOOD-SAGE-SEA-SALT-100'), 14, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wood-sage-sea-salt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670184-800-800/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex.jpg', 'Wood Sage & Sea Salt — Jo Malone London', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670184-800-800/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wood-sage-sea-salt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670185-800-800/690251179978_1.jpg', 'Wood Sage & Sea Salt — Jo Malone London (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670185-800-800/690251179978_1.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'wood-sage-sea-salt'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670186-800-800/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex--2-.jpg', 'Wood Sage & Sea Salt — Jo Malone London (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2670186-800-800/wood-sage-e-sea-salt-cologne-jo-malone-perfume-unissex--2-.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Lattafa — Khamrah
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('khamrah',
  (select id from public.brands where slug = 'lattafa'),
  (select id from public.categories where slug = 'perfumes-unissex'),
  'Khamrah', 'khamrah-lattafa', 'Árabe unissex marcante e duradouro.', 'Khamrah é uma fragrância unissex em versão Eau de Parfum de Lattafa. A pirâmide olfativa ainda não foi confirmada por fonte confiável.',
  'unissex', 'importado', 'Eau de Parfum', null,
  null, null, null, null, null,
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-khamrah-lattafa-edp-unissex-100ml-193927/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'khamrah'), 'SLY-KHAMRAH-100', '6291108737194', 100, 20490, 26990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-KHAMRAH-100'), 25, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'khamrah'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562493-800-800/17720969369738.jpg', 'Khamrah — Lattafa', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562493-800-800/17720969369738.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'khamrah'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562500-800-800/17720969398554.jpg', 'Khamrah — Lattafa (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562500-800-800/17720969398554.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'khamrah'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562511-800-800/17720969428324.jpg', 'Khamrah — Lattafa (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1562511-800-800/17720969428324.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Liz Flora
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('liz-flora',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Liz Flora', 'liz-flora-o-boticario', 'Flor de jacarandá e íris sobre a assinatura amadeirada de Liz.', 'Liz Flora é uma fragrância feminina em versão Desodorante Colônia de O Boticário, da família olfativa amadeirado floral. Entre os ingredientes em destaque estão flor de jacarandá e íris. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'nacional', 'Desodorante Colônia', 'Amadeirado Floral',
  null, null, null, array['Flor de Jacarandá', 'Íris']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-feminino-o-boticario-liz-flora-100ml-303809/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'liz-flora'), 'SLY-LIZ-FLORA-100', '7893596510168', 100, 11990, 17990, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LIZ-FLORA-100'), 19, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'liz-flora'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429273-800-800/17919197724206.jpg', 'Liz Flora — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429273-800-800/17919197724206.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'liz-flora'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429293-800-800/17919197752769.jpg', 'Liz Flora — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429293-800-800/17919197752769.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'liz-flora'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429251-800-800/17919197787236.jpg', 'Liz Flora — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3429251-800-800/17919197787236.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Egeo Choc
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('egeo-choc',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Egeo Choc', 'egeo-choc-o-boticario', 'Chocolate e chantilly num gourmand divertido.', 'Egeo Choc é uma fragrância feminina em versão Desodorante Colônia de O Boticário. A composição abre com acorde de chantilly, pêssego, limão siciliano e frutas silvestres, revela no coração almíscar, baunilha, benjoim, madeiras cremosas, âmbar e sândalo e assenta sobre flor de laranjeira, pêssego, acorde de chocolate e creme de leite.',
  'feminino', 'nacional', 'Desodorante Colônia', null,
  array['Acorde de Chantilly', 'Pêssego', 'Limão Siciliano', 'Frutas Silvestres']::text[], array['Almíscar', 'Baunilha', 'Benjoim', 'Madeiras Cremosas', 'Âmbar', 'Sândalo']::text[], array['Flor de Laranjeira', 'Pêssego', 'Acorde de Chocolate', 'Creme de Leite']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/egeo-choc-desodorante-colonia-90ml-|-original-264879/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'egeo-choc'), 'SLY-EGEO-CHOC-090', '7891033826896', 90, 24990, 32900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-EGEO-CHOC-090'), 13, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'egeo-choc'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836361-800-800/17852076005060.jpg', 'Egeo Choc — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836361-800-800/17852076005060.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'egeo-choc'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836378-800-800/17852076014185.jpg', 'Egeo Choc — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836378-800-800/17852076014185.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'egeo-choc'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836363-800-800/17852076033223.jpg', 'Egeo Choc — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2836363-800-800/17852076033223.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Malbec Eau de Parfum
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('malbec-edp',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Malbec Eau de Parfum', 'malbec-eau-de-parfum-o-boticario', 'Madeira de barril e frutas vermelhas, intenso e sofisticado.', 'Malbec Eau de Parfum é uma fragrância masculina em versão Eau de Parfum de O Boticário, da família olfativa amadeirado aromático. Entre os ingredientes em destaque estão madeira de barril, frutas vermelhas e especiarias. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'masculino', 'nacional', 'Eau de Parfum', 'Amadeirado Aromático',
  null, null, null, array['Madeira de Barril', 'Frutas Vermelhas', 'Especiarias']::text[], null,
  'published', true, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/malbec-eau-de-parfum-90ml-|-original-264723/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'malbec-edp'), 'SLY-MALBEC-EDP-090', '7891033843855', 90, 46990, 59900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-MALBEC-EDP-090'), 25, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835508-800-800/17852076010270.jpg', 'Malbec Eau de Parfum — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835508-800-800/17852076010270.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835511-800-800/17852076018801.jpg', 'Malbec Eau de Parfum — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835511-800-800/17852076018801.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-edp'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835513-800-800/17852076029162.jpg', 'Malbec Eau de Parfum — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/2835513-800-800/17852076029162.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- O Boticário — Malbec Gold
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('malbec-gold',
  (select id from public.brands where slug = 'o-boticario'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Malbec Gold', 'malbec-gold-o-boticario', 'Amadeirado ambarado quente com couro e flor de laranjeira.', 'Malbec Gold é uma fragrância masculina em versão Desodorante Colônia de O Boticário, da família olfativa amadeirado ambarado. Entre os ingredientes em destaque estão flor de laranjeira, couro e madeiras. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'masculino', 'nacional', 'Desodorante Colônia', 'Amadeirado Ambarado',
  null, null, null, array['Flor de Laranjeira', 'Couro', 'Madeiras']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/malbec-gold-desodorante-colonia-100ml-194532/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'malbec-gold'), 'SLY-MALBEC-GOLD-100', '7891033738496', 100, 35991, 55000, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-MALBEC-GOLD-100'), 0, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-gold'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570063-800-800/17726840971265.jpg', 'Malbec Gold — O Boticário', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570063-800-800/17726840971265.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-gold'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570066-800-800/17726840982622.jpg', 'Malbec Gold — O Boticário (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570066-800-800/17726840982622.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'malbec-gold'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570123-800-800/17726841029052.jpg', 'Malbec Gold — O Boticário (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570123-800-800/17726841029052.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Natura — Kaiak
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('kaiak',
  (select id from public.brands where slug = 'natura'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Kaiak', 'kaiak-natura', 'Clássico aquático brasileiro, fresco e versátil.', 'Kaiak é uma fragrância masculina em versão Desodorante Colônia de Natura, da família olfativa aromático. A composição abre com bergamota, diidromircenol e manjericão, revela no coração madeiras transparentes, flor de laranjeira e muguet e assenta sobre almíscar, sândalo e agulhas de pinho.',
  'masculino', 'nacional', 'Desodorante Colônia', 'Aromático',
  array['Bergamota', 'Diidromircenol', 'Manjericão']::text[], array['Madeiras Transparentes', 'Flor de Laranjeira', 'Muguet']::text[], array['Almíscar', 'Sândalo', 'Agulhas de Pinho']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/desodorante-colonia-masculino-kaiak-tradicional-natura-100ml-279402/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'kaiak'), 'SLY-KAIAK-100', '7908371662755', 100, 17798, 19698, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-KAIAK-100'), 20, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'kaiak'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066528-800-800/17880955947389.jpg', 'Kaiak — Natura', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066528-800-800/17880955947389.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'kaiak'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066519-800-800/17880955972416.jpg', 'Kaiak — Natura (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066519-800-800/17880955972416.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'kaiak'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066532-800-800/17880956000116.jpg', 'Kaiak — Natura (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3066532-800-800/17880956000116.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Natura — Essencial Exclusivo Feminino
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('essencial-exclusivo',
  (select id from public.brands where slug = 'natura'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Essencial Exclusivo Feminino', 'essencial-exclusivo-feminino-natura', 'Buquê de rosa e magnólia com frutas vermelhas.', 'Essencial Exclusivo Feminino é uma fragrância feminina em versão Deo Parfum de Natura. A composição abre com mandarina, laranja, maçã, framboesa, frutas vermelhas e cassis, revela no coração rosa, magnólia, jasmim, frésia e lírio e assenta sobre madeiras preciosas, âmbar, almíscar, sândalo, pêssego e vetiver.',
  'feminino', 'nacional', 'Deo Parfum', null,
  array['Mandarina', 'Laranja', 'Maçã', 'Framboesa', 'Frutas Vermelhas', 'Cassis']::text[], array['Rosa', 'Magnólia', 'Jasmim', 'Frésia', 'Lírio']::text[], array['Madeiras Preciosas', 'Âmbar', 'Almíscar', 'Sândalo', 'Pêssego', 'Vetiver']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/natura-essencial-exclusivo-deo-parfum-100-ml-194521/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'essencial-exclusivo'), 'SLY-ESSENCIAL-EXCLUSIVO-100', '7908132288590', 100, 44990, 46900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ESSENCIAL-EXCLUSIVO-100'), 7, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-exclusivo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570058-800-800/17727885396111.jpg', 'Essencial Exclusivo Feminino — Natura', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570058-800-800/17727885396111.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-exclusivo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570080-800-800/17727885411026.jpg', 'Essencial Exclusivo Feminino — Natura (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570080-800-800/17727885411026.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-exclusivo'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570057-800-800/17727885429274.jpg', 'Essencial Exclusivo Feminino — Natura (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570057-800-800/17727885429274.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Natura — Essencial Clássico Masculino
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('essencial-classico',
  (select id from public.brands where slug = 'natura'),
  (select id from public.categories where slug = 'perfumes-masculinos'),
  'Essencial Clássico Masculino', 'essencial-classico-masculino-natura', 'Verde e amadeirado, um clássico elegante brasileiro.', 'Essencial Clássico Masculino é uma fragrância masculina em versão Deo Parfum de Natura. A composição abre com bergamota, lavanda, gálbano, zimbro, noz-moscada, grapefruit e manjericão, revela no coração gerânio, patchouli, alecrim, sálvia e jasmim e assenta sobre cedro, almíscar, musgo de carvalho, sândalo, âmbar, bálsamo de abeto e mirra.',
  'masculino', 'nacional', 'Deo Parfum', null,
  array['Bergamota', 'Lavanda', 'Gálbano', 'Zimbro', 'Noz-moscada', 'Grapefruit', 'Manjericão']::text[], array['Gerânio', 'Patchouli', 'Alecrim', 'Sálvia', 'Jasmim']::text[], array['Cedro', 'Almíscar', 'Musgo de Carvalho', 'Sândalo', 'Âmbar', 'Bálsamo de Abeto', 'Mirra']::text[], null, null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/natura-deo-parfum-essencial-classico-masculino-100ml-194522/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'essencial-classico'), 'SLY-ESSENCIAL-CLASSICO-100', '7899563210345', 100, 44990, 46900, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-ESSENCIAL-CLASSICO-100'), 22, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-classico'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570061-800-800/17727885406086.jpg', 'Essencial Clássico Masculino — Natura', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570061-800-800/17727885406086.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-classico'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570054-800-800/17727885417063.jpg', 'Essencial Clássico Masculino — Natura (foto 2)', 1, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570054-800-800/17727885417063.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'essencial-classico'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570093-800-800/17727885467351.jpg', 'Essencial Clássico Masculino — Natura (foto 3)', 2, false, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/1570093-800-800/17727885467351.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

-- Natura — Luna Clássico
insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values ('luna-classico',
  (select id from public.brands where slug = 'natura'),
  (select id from public.categories where slug = 'perfumes-femininos'),
  'Luna Clássico', 'luna-classico-natura', 'Chipre frutal icônico da perfumaria brasileira.', 'Luna Clássico é uma fragrância feminina em versão Desodorante Colônia de Natura, da família olfativa chipre frutal. Entre os ingredientes em destaque estão frutas vermelhas, notas florais e fundo amadeirado. A pirâmide olfativa completa não foi confirmada por fonte confiável.',
  'feminino', 'nacional', 'Desodorante Colônia', 'Chipre Frutal',
  null, null, null, array['Frutas Vermelhas', 'Notas Florais', 'Fundo Amadeirado']::text[], null,
  'published', false, 'pending',
  '{"info":"https://www.epocacosmeticos.com.br/perfume-feminino-natura-luna-classico-75ml-298813/p","consulted_at":"2026-11-08","notes_policy":"notas somente quando explícitas na fonte"}'::jsonb)
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';
insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = 'luna-classico'), 'SLY-LUNA-CLASSICO-075', '7893596516726', 75, 11990, 18590, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;
with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = 'SLY-LUNA-CLASSICO-075'), 16, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;
insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = 'luna-classico'), 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3300112-800-800/17908780829323.jpg', 'Luna Clássico — Natura', 0, true, 'https://epocacosmeticos.vteximg.com.br/arquivos/ids/3300112-800-800/17908780829323.jpg',
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;

commit;
