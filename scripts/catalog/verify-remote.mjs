#!/usr/bin/env node
/**
 * Verifica, com a chave PÚBLICA (como um visitante), se a carga está correta no Supabase:
 * quantidade publicada, variantes, disponibilidade, preços, imagens acessíveis e
 * ausência de duplicatas, e que as funções do painel recusam visitantes. Somente leitura. Gera supabase/seed/catalog.load-report.json.
 * Uso: node --env-file=.env.local scripts/catalog/verify-remote.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "../..");
const expected = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.json"), "utf8")).products;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) { console.error("Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."); process.exit(1); }
const supabase = createClient(url, anon, { auth: { persistSession: false } });

const checks = [];
const check = (name, ok, detail = "") => { checks.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`); };

const all = [];
for (let page = 1; page <= 10; page++) {
  const { data, error } = await supabase.rpc("search_catalog", { p_page: page, p_page_size: 48 });
  if (error) { check("RPC search_catalog acessível ao público", false, error.message); break; }
  all.push(...data.items);
  if (all.length >= data.total) break;
}
const slugs = all.map((i) => i.slug);
check("≥ 40 produtos publicados visíveis no catálogo público", all.length >= 40, `${all.length} produtos`);
check("todos os produtos do seed estão publicados", expected.every((p) => slugs.includes(p.slug)), `${expected.filter((p) => !slugs.includes(p.slug)).map((p) => p.slug).join(", ") || "ok"}`);
check("sem produtos duplicados", new Set(slugs).size === slugs.length);
check("todo produto tem preço > 0 em centavos inteiros", all.every((i) => Number.isInteger(i.min_price_cents) && i.min_price_cents > 0));
check("todo produto tem imagem", all.every((i) => i.image_path || i.image_url));

const inv = await supabase.from("inventory").select("on_hand").limit(1);
check("quantidade de estoque NÃO é exposta ao público", Boolean(inv.error), inv.error?.message ?? "on_hand legível!");

const sample = expected[0];
const { data: detail } = await supabase.rpc("get_product", { p_slug: sample.slug });
check(`detalhe de "${sample.slug}" com todas as variantes`, detail?.variants?.length === sample.variants.length, `${detail?.variants?.length ?? 0}/${sample.variants.length}`);
check("preços batem com a referência do seed", sample.variants.every((v) => detail?.variants?.some((d) => d.sku === v.sku && d.price_cents === v.price_cents)));

let broken = 0;
for (const item of all) {
  const src = item.image_path ? `${url}/storage/v1/object/public/product-images/${item.image_path}` : item.image_url;
  const r = await fetch(src, { method: "HEAD" }).catch(() => null);
  if (!r?.ok) broken++;
}
check("imagens principais carregam (HTTP 200)", broken === 0, `${all.length - broken}/${all.length}`);
check("imagens servidas pelo Storage do Supabase", all.every((i) => i.image_path), `${all.filter((i) => i.image_path).length}/${all.length} no Storage`);

// Fase 5: funções e auditoria do painel recusam visitantes.
const zero = "00000000-0000-0000-0000-000000000000";
const blocked = async (label, promise) => { const { error } = await promise; check(`visitante bloqueado: ${label}`, Boolean(error), error?.code ?? "PERMITIDO!"); };
await blocked("admin_update_stock", supabase.rpc("admin_update_stock", { p_variant_id: zero, p_mode: "set", p_quantity: 1, p_min_stock: 1, p_reason: "teste" }));
await blocked("admin_list_inventory", supabase.rpc("admin_list_inventory", {}));
await blocked("admin_dashboard_stats", supabase.rpc("admin_dashboard_stats"));
await blocked("admin_set_primary_image", supabase.rpc("admin_set_primary_image", { p_image_id: zero }));
await blocked("leitura da auditoria", supabase.from("audit_logs").select("id").limit(1));
await blocked("escrita na auditoria", supabase.from("audit_logs").insert({ action: "update", entity: "x", entity_id: "y" }));

const report = { verifiedAt: new Date().toISOString(), products: all.length, checks };
fs.writeFileSync(path.join(root, "supabase/seed/catalog.load-report.json"), JSON.stringify(report, null, 2) + "\n");
process.exit(checks.every((c) => c.ok) ? 0 : 1);
