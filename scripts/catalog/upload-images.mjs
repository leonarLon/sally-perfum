#!/usr/bin/env node
/**
 * Envia as imagens do seed ao Supabase Storage (bucket product-images) e preenche
 * product_images.storage_path. Idempotente (upsert por caminho estável).
 *
 * REQUER autorização explícita: grava no projeto Supabase remoto.
 * Uso: node --env-file=.env.local scripts/catalog/upload-images.mjs [--dry-run]
 *
 * Validações (não confia na extensão nem no content-type informado):
 *  - assinatura binária (magic bytes) JPEG / PNG / WebP
 *  - tamanho entre 5 KB e 5 MB
 */
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(import.meta.dirname, "../..");
const dryRun = process.argv.includes("--dry-run");
const { products } = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.json"), "utf8"));
const MIN = 5 * 1024;
const MAX = 5 * 1024 * 1024;

export function detectImageType(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { mime: "image/png", ext: "png" };
  if (buf.length >= 12 && buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY (.env.local).");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const report = { startedAt: new Date().toISOString(), dryRun, uploaded: 0, skipped: 0, failed: [] };

  for (const p of products) {
    const { data: product } = await supabase.from("products").select("id").eq("seed_key", p.key).maybeSingle();
    if (!product) { report.failed.push(`${p.key}: produto não existe no banco (rode o seed antes)`); continue; }
    for (const [position, img] of p.images.entries()) {
      try {
        const res = await fetch(img.source_url, { headers: { "user-agent": "Mozilla/5.0 (Sally study project)" } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = Buffer.from(await res.arrayBuffer());
        const type = detectImageType(buf);
        if (!type) throw new Error("assinatura binária não é JPEG/PNG/WebP");
        if (buf.length < MIN || buf.length > MAX) throw new Error(`tamanho fora do limite (${buf.length} bytes)`);
        const storagePath = `seed/${p.key}/${position}.${type.ext}`;
        if (!dryRun) {
          const up = await supabase.storage.from("product-images").upload(storagePath, buf, { contentType: type.mime, upsert: true, cacheControl: "31536000" });
          if (up.error) throw up.error;
          const upd = await supabase.from("product_images").update({ storage_path: storagePath }).eq("product_id", product.id).eq("position", position);
          if (upd.error) throw upd.error;
        }
        report.uploaded++;
        console.log(`${dryRun ? "[dry-run] " : ""}✓ ${storagePath} (${Math.round(buf.length / 1024)} KB)`);
      } catch (e) {
        report.failed.push(`${p.key}#${position}: ${e.message ?? e}`);
      }
    }
  }
  report.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(root, "supabase/seed/images.upload-report.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(`\nEnviadas: ${report.uploaded} | Falhas: ${report.failed.length}`);
  if (report.failed.length) console.log("- " + report.failed.join("\n- "));
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, "/")}` || process.argv[1]?.endsWith("upload-images.mjs")) {
  main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
}
