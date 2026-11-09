// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = path.resolve(__dirname, "../..");
type Variant = { sku: string; volume_ml: number; barcode: string | null; price_cents: number; compare_at_cents: number | null; demo_stock: number };
type Product = {
  key: string; slug: string; name: string; brand: string; gender: string; origin: string;
  top_notes: string[] | null; heart_notes: string[] | null; base_notes: string[] | null; highlights: string[] | null;
  short_description: string; variants: Variant[]; images: { source_url: string }[]; sources: { info: string | null };
};
const { products } = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.json"), "utf8")) as { products: Product[] };
const facts = JSON.parse(fs.readFileSync(path.join(root, "supabase/seed/catalog.facts.json"), "utf8")) as { products: { key: string }[] };

describe("dados do seed", () => {
  it("tem pelo menos 40 produtos, todos com fatos curados correspondentes", () => {
    expect(products.length).toBeGreaterThanOrEqual(40);
    expect(new Set(products.map((p) => p.key))).toEqual(new Set(facts.products.map((f) => f.key)));
  });

  it("slugs, chaves e SKUs são únicos e válidos", () => {
    const slugs = products.map((p) => p.slug);
    const skus = products.flatMap((p) => p.variants.map((v) => v.sku));
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(skus).size).toBe(skus.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    for (const s of skus) expect(s).toMatch(/^[A-Z0-9][A-Z0-9-]{2,63}$/);
  });

  it("cada produto tem ao menos uma variante com preço em centavos inteiros e promoção coerente", () => {
    for (const p of products) {
      expect(p.variants.length, p.key).toBeGreaterThan(0);
      for (const v of p.variants) {
        expect(Number.isSafeInteger(v.price_cents) && v.price_cents > 0, v.sku).toBe(true);
        if (v.compare_at_cents !== null) expect(v.compare_at_cents, v.sku).toBeGreaterThan(v.price_cents);
        expect(v.volume_ml, v.sku).toBeGreaterThan(0);
        if (v.barcode) expect(v.barcode).toMatch(/^\d{8,14}$/);
        expect(Number.isSafeInteger(v.demo_stock) && v.demo_stock >= 0).toBe(true);
      }
    }
  });

  it("cada produto tem imagem https com origem documentada", () => {
    for (const p of products) {
      expect(p.images.length, p.key).toBeGreaterThan(0);
      for (const img of p.images) expect(img.source_url).toMatch(/^https:\/\//);
      expect(p.sources.info, p.key).toMatch(/^https:\/\//);
    }
  });

  it("notas olfativas são null (não confirmadas) ou listas não vazias — nunca strings vazias", () => {
    for (const p of products) {
      for (const notes of [p.top_notes, p.heart_notes, p.base_notes, p.highlights]) {
        if (notes === null) continue;
        expect(Array.isArray(notes) && notes.length > 0, p.key).toBe(true);
        for (const n of notes) expect(n.trim().length, p.key).toBeGreaterThan(0);
      }
    }
  });

  it("catálogo é variado: gêneros, origens e marcas", () => {
    const by = (k: keyof Product) => new Set(products.map((p) => p[k] as string));
    expect(by("gender")).toEqual(new Set(["feminino", "masculino", "unissex"]));
    expect(by("origin")).toEqual(new Set(["nacional", "importado"]));
    expect(by("brand").size).toBeGreaterThanOrEqual(20);
  });

  it("estoque de demonstração inclui casos esgotados e de estoque baixo para exercitar a UI", () => {
    const stocks = products.flatMap((p) => p.variants.map((v) => v.demo_stock));
    expect(stocks.some((s) => s === 0)).toBe(true);
    expect(stocks.some((s) => s > 0 && s <= 3)).toBe(true);
  });

  it("o SQL do seed está sincronizado com o catalog.json", () => {
    const sql = fs.readFileSync(path.join(root, "supabase/seed/catalog.seed.sql"), "utf8");
    for (const p of products) {
      expect(sql, p.key).toContain(`'${p.key}'`);
      for (const v of p.variants) expect(sql, v.sku).toContain(`'${v.sku}'`);
    }
  });
});
