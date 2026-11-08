#!/usr/bin/env node
/**
 * Gera supabase/seed/catalog.json a partir de:
 *  - supabase/seed/catalog.facts.json   (fatos curados: notas, família, textos próprios)
 *  - supabase/seed/catalog.sources.json (IDs na API pública de catálogo da fonte de referência)
 *
 * Busca variantes (volume, EAN), preços de REFERÊNCIA e URLs de imagem; verifica se
 * cada imagem carrega (status 200, content-type image/*, tamanho mínimo).
 * Uso: node scripts/catalog/build-seed-data.mjs
 *
 * Não grava nada no banco. O seed (scripts/catalog/seed.mjs) é que lê o JSON gerado.
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const facts = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.facts.json"), "utf8"));
const { baseUrl, sources } = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.sources.json"), "utf8"));
const UA = { "user-agent": "Mozilla/5.0 (Sally Perfumaria study project)" };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, " e ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Converte "R$" decimal da API (ex.: 529.9) para centavos inteiros sem erro de float. */
const toCents = (n) => Math.round(Number(n) * 100);

function parseVolume(item) {
  const raw = item.tamanho?.[0] ?? item.name;
  const m = /(\d+(?:[.,]\d+)?)\s*ml/i.exec(raw);
  return m ? Math.round(Number(m[1].replace(",", "."))) : null;
}

/** Quantidade de demonstração determinística por SKU (inclui alguns esgotados e estoque baixo). */
function demoStock(sku) {
  let h = 0;
  for (const c of sku) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = h % 20;
  if (r === 0) return 0; // ~5% esgotado
  if (r <= 2) return 2; // ~10% estoque baixo
  return 4 + (h % 22);
}

/** Imagem em 800x800 pelo padrão de redimensionamento da CDN VTEX (/ids/<id>-800-800/). */
const resizeVtex = (url) => url.replace(/\/ids\/(\d+)\//, "/ids/$1-800-800/").replace(/\?.*$/, "");

async function checkImage(url) {
  try {
    const r = await fetch(url, { headers: UA });
    const type = r.headers.get("content-type") ?? "";
    const buf = Buffer.from(await r.arrayBuffer());
    return { ok: r.ok && type.startsWith("image/") && buf.length > 5_000, status: r.status, type, bytes: buf.length };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

const out = [];
const report = { generatedAt: new Date().toISOString(), products: 0, variants: 0, images: 0, problems: [] };

for (const f of facts.products) {
  const ids = sources[f.key];
  if (!ids) { report.problems.push(`${f.key}: sem fonte`); continue; }
  const listings = [];
  for (const id of ids) {
    const r = await fetch(`${baseUrl}/api/catalog_system/pub/products/search?fq=productId:${id}`, { headers: UA });
    const j = r.ok ? await r.json() : [];
    if (!j.length) report.problems.push(`${f.key}: anúncio ${id} indisponível (HTTP ${r.status})`);
    listings.push(...j);
    await sleep(300);
  }

  const byVolume = new Map();
  const imageUrls = [];
  for (const p of listings) {
    for (const it of p.items) {
      const offer = it.sellers?.[0]?.commertialOffer ?? {};
      const vol = parseVolume(it);
      const list = toCents(offer.ListPrice ?? 0);
      const price = toCents(offer.Price ?? 0);
      if (!vol || list <= 0 || price <= 0) continue;
      if (!byVolume.has(vol)) {
        byVolume.set(vol, {
          volume_ml: vol,
          barcode: /^\d{8,14}$/.test(it.ean ?? "") ? it.ean : null,
          reference_list_cents: list,
          reference_price_cents: price,
          source_url: `${baseUrl}/${p.linkText}/p`,
        });
      }
      for (const img of it.images ?? []) {
        const u = resizeVtex(img.imageUrl);
        if (!imageUrls.includes(u)) imageUrls.push(u);
      }
    }
  }

  const variants = [...byVolume.values()].sort((a, b) => a.volume_ml - b.volume_ml).map((v) => {
    const sku = `SLY-${f.key.toUpperCase()}-${String(v.volume_ml).padStart(3, "0")}`;
    const promo = v.reference_price_cents < v.reference_list_cents;
    return {
      sku,
      volume_ml: v.volume_ml,
      barcode: v.barcode,
      price_cents: promo ? v.reference_price_cents : v.reference_list_cents,
      compare_at_cents: promo ? v.reference_list_cents : null,
      demo_stock: demoStock(sku),
      price_source_url: v.source_url,
    };
  });
  if (!variants.length) { report.problems.push(`${f.key}: nenhuma variante com preço`); continue; }

  const images = [];
  for (const url of imageUrls.slice(0, 3)) {
    const check = await checkImage(url);
    if (check.ok) images.push({ source_url: url, bytes: check.bytes, content_type: check.type });
    else report.problems.push(`${f.key}: imagem falhou ${url} ${JSON.stringify(check)}`);
    await sleep(150);
  }
  if (!images.length) report.problems.push(`${f.key}: SEM IMAGEM — usará placeholder identificado`);

  out.push({
    key: f.key,
    slug: slugify(`${f.name} ${f.brand}`),
    name: f.name,
    brand: f.brand,
    brand_slug: slugify(f.brand),
    gender: f.gender,
    origin: f.origin,
    category_slug: `perfumes-${f.gender === "feminino" ? "femininos" : f.gender === "masculino" ? "masculinos" : "unissex"}`,
    concentration: f.concentration,
    olfactory_family: f.family,
    top_notes: f.top,
    heart_notes: f.heart,
    base_notes: f.base,
    highlights: f.highlights ?? null,
    short_description: f.tagline,
    occasion: f.occasion ?? null,
    variants,
    images,
    sources: { info: listings[0] ? `${baseUrl}/${listings[0].linkText}/p` : null, consulted_at: report.generatedAt.slice(0, 10) },
  });
  report.products++;
  report.variants += variants.length;
  report.images += images.length;
  console.log(`✓ ${f.key}: ${variants.length} variante(s), ${images.length} imagem(ns)`);
}

fs.writeFileSync(path.join(root, "supabase/seed/catalog.json"), JSON.stringify({ products: out }, null, 2) + "\n");
fs.writeFileSync(path.join(root, "supabase/seed/catalog.build-report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`\nProdutos: ${report.products} | Variantes: ${report.variants} | Imagens: ${report.images}`);
if (report.problems.length) console.log("Problemas:\n- " + report.problems.join("\n- "));
