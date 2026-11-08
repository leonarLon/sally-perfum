#!/usr/bin/env node
/**
 * Gera supabase/seed/catalog.seed.sql (idempotente) a partir de supabase/seed/catalog.json.
 *
 * Garantias:
 *  - Produtos por seed_key e variantes por SKU: reexecutar NÃO duplica.
 *  - Conteúdo só é atualizado enquanto commercial_review = 'pending';
 *    preço só enquanto price_is_reference = true (preço confirmado pelo dono é preservado).
 *  - Estoque é criado apenas se não existir (nunca sobrescreve contagem real);
 *    a criação registra uma movimentação 'seed'.
 *  - Imagens entram com external_url (origem documentada); o upload para o Storage é
 *    feito depois por scripts/catalog/upload-images.mjs, que preenche storage_path.
 */
import fs from "node:fs";
import path from "node:path";
import { buildDescription } from "./description.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const { products } = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.json"), "utf8"));

const FEATURED = new Set(["la-vie-est-belle", "good-girl", "libre", "sauvage-edt", "1-million", "invictus", "khamrah", "malbec-edp"]);
const CATEGORIES = [
  { slug: "perfumes-femininos", name: "Perfumes Femininos", position: 1 },
  { slug: "perfumes-masculinos", name: "Perfumes Masculinos", position: 2 },
  { slug: "perfumes-unissex", name: "Perfumes Unissex", position: 3 },
];

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => (a && a.length ? `array[${a.map(q).join(", ")}]::text[]` : "null");
const int = (n) => (n === null || n === undefined ? "null" : String(Math.trunc(n)));
const json = (o) => `${q(JSON.stringify(o))}::jsonb`;

const lines = [];
const emit = (s) => lines.push(s);

emit("-- GERADO por scripts/catalog/generate-seed-sql.mjs — não edite à mão.");
emit(`-- ${products.length} produtos | dados de referência (preços) e estoque de DEMONSTRAÇÃO.`);
emit("begin;");
emit("");
emit("-- Categorias");
for (const c of CATEGORIES) {
  emit(`insert into public.categories (slug, name, position) values (${q(c.slug)}, ${q(c.name)}, ${c.position})
  on conflict (slug) do update set name = excluded.name, position = excluded.position;`);
}

emit("\n-- Marcas");
const brands = new Map(products.map((p) => [p.brand_slug, p.brand]));
for (const [slug, name] of brands) {
  emit(`insert into public.brands (slug, name) values (${q(slug)}, ${q(name)})
  on conflict (slug) do update set name = excluded.name;`);
}

for (const p of products) {
  const description = buildDescription(p);
  emit(`\n-- ${p.brand} — ${p.name}`);
  emit(`insert into public.products (seed_key, brand_id, category_id, name, slug, short_description, description,
  gender, origin, concentration, olfactory_family, top_notes, heart_notes, base_notes, highlights, occasion,
  status, featured, commercial_review, data_sources)
values (${q(p.key)},
  (select id from public.brands where slug = ${q(p.brand_slug)}),
  (select id from public.categories where slug = ${q(p.category_slug)}),
  ${q(p.name)}, ${q(p.slug)}, ${q(p.short_description)}, ${q(description)},
  ${q(p.gender)}, ${q(p.origin)}, ${q(p.concentration)}, ${q(p.olfactory_family)},
  ${arr(p.top_notes)}, ${arr(p.heart_notes)}, ${arr(p.base_notes)}, ${arr(p.highlights)}, ${q(p.occasion)},
  'published', ${FEATURED.has(p.key)}, 'pending',
  ${json({ info: p.sources.info, consulted_at: p.sources.consulted_at, notes_policy: "notas somente quando explícitas na fonte" })})
on conflict (seed_key) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  short_description = excluded.short_description, description = excluded.description,
  gender = excluded.gender, origin = excluded.origin, concentration = excluded.concentration,
  olfactory_family = excluded.olfactory_family, top_notes = excluded.top_notes,
  heart_notes = excluded.heart_notes, base_notes = excluded.base_notes, highlights = excluded.highlights,
  occasion = excluded.occasion, data_sources = excluded.data_sources
where public.products.commercial_review = 'pending';`);

  for (const v of p.variants) {
    emit(`insert into public.product_variants (product_id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference)
values ((select id from public.products where seed_key = ${q(p.key)}), ${q(v.sku)}, ${q(v.barcode)}, ${int(v.volume_ml)}, ${int(v.price_cents)}, ${int(v.compare_at_cents)}, true)
on conflict (sku) do update set
  barcode = excluded.barcode, volume_ml = excluded.volume_ml,
  price_cents = excluded.price_cents, compare_at_cents = excluded.compare_at_cents
where public.product_variants.price_is_reference;`);
    emit(`with created as (
  insert into public.inventory (variant_id, on_hand, min_stock, is_demo_quantity)
  values ((select id from public.product_variants where sku = ${q(v.sku)}), ${int(v.demo_stock)}, 3, true)
  on conflict (variant_id) do nothing
  returning variant_id, on_hand
)
insert into public.inventory_movements (variant_id, type, quantity, reason)
select variant_id, 'seed', on_hand, 'Estoque inicial de DEMONSTRAÇÃO (seed)' from created where on_hand > 0;`);
  }

  p.images.forEach((img, i) => {
    emit(`insert into public.product_images (product_id, external_url, alt, position, is_primary, source_url, license_note)
values ((select id from public.products where seed_key = ${q(p.key)}), ${q(img.source_url)}, ${q(`${p.name} — ${p.brand}${i ? ` (foto ${i + 1})` : ""}`)}, ${i}, ${i === 0}, ${q(img.source_url)},
  'Imagem pública de varejista usada apenas em projeto de estudo, sem licença comercial. Substituir antes de uso comercial.')
on conflict (product_id, position) do update set
  external_url = excluded.external_url, alt = excluded.alt, source_url = excluded.source_url, license_note = excluded.license_note;`);
  });
}

emit("\ncommit;");
const out = path.join(root, "supabase/seed/catalog.seed.sql");
fs.writeFileSync(out, lines.join("\n") + "\n");
console.log(`Gerado ${path.relative(root, out)}: ${products.length} produtos, ${products.reduce((n, p) => n + p.variants.length, 0)} variantes.`);
