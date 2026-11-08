// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, seedSql } from "./harness";

type Item = {
  id: string; slug: string; name: string; brand_slug: string; gender: string; origin: string;
  family_group: string | null; min_price_cents: number; has_promo: boolean; in_stock: boolean;
  image_url: string | null; image_path: string | null;
};
type Page = { total: number; page: number; page_size: number; items: Item[] };

describe("RPC do catálogo (grupos 1–7)", () => {
  let db: PGlite;
  const search = async (args: Record<string, unknown> = {}) => {
    const keys = Object.keys(args);
    const sql = `select public.search_catalog(${keys.map((k, i) => `${k} => $${i + 1}`).join(", ")}) as r`;
    const [row] = await as<{ r: Page }>(db, { role: "anon" }, sql, Object.values(args));
    return row.r;
  };

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
  }, 60_000);

  it("lista o catálogo publicado com total e paginação padrão (grupo 1 e 5)", async () => {
    const r = await search();
    expect(r.total).toBeGreaterThanOrEqual(40);
    expect(r.items).toHaveLength(24);
    expect(r.page).toBe(1);
    const p2 = await search({ p_page: 2 });
    expect(p2.items.length).toBe(r.total - 24);
    const ids = new Set([...r.items, ...p2.items].map((i) => i.id));
    expect(ids.size).toBe(r.total); // sem repetição entre páginas
  });

  it("limita o tamanho de página a 48 e trata página inválida", async () => {
    expect((await search({ p_page_size: 500 })).page_size).toBe(48);
    expect((await search({ p_page: -3 })).page).toBe(1);
    expect((await search({ p_page: 99 })).items).toHaveLength(0);
  });

  it("busca por nome, marca ou nota, ignorando acentos e caixa (grupo 2)", async () => {
    expect((await search({ p_q: "SAUVAGE" })).items.map((i) => i.slug)).toContain("sauvage-dior");
    expect((await search({ p_q: "idole" })).items.map((i) => i.slug)).toContain("idole-lancome");
    expect((await search({ p_q: "lattafa" })).items.every((i) => i.brand_slug === "lattafa")).toBe(true);
    const baunilha = await search({ p_q: "baunilha" });
    expect(baunilha.total).toBeGreaterThan(3);
  });

  it("busca com vários termos exige todos (AND)", async () => {
    const r = await search({ p_q: "carolina vip" });
    expect(r.total).toBeGreaterThan(0);
    expect(r.items.every((i) => i.brand_slug === "carolina-herrera")).toBe(true);
  });

  it("busca sem resultados e com curingas de LIKE não quebra", async () => {
    expect((await search({ p_q: "xyzinexistente" })).total).toBe(0);
    expect((await search({ p_q: "%%%" })).total).toBeGreaterThanOrEqual(40);
    expect((await search({ p_q: "'; drop table products; --" })).total).toBe(0);
    expect((await search()).total).toBeGreaterThanOrEqual(40); // tabela intacta
  });

  it("filtra por gênero, origem, marca, família, promoção e faixa de preço (grupo 3)", async () => {
    const fem = await search({ p_gender: "feminino", p_page_size: 48 });
    expect(fem.items.every((i) => i.gender === "feminino")).toBe(true);
    const nac = await search({ p_origin: "nacional", p_page_size: 48 });
    expect(nac.total).toBeGreaterThanOrEqual(5);
    expect(nac.items.every((i) => i.origin === "nacional")).toBe(true);
    const dior = await search({ p_brand: "dior" });
    expect(dior.items.every((i) => i.brand_slug === "dior")).toBe(true);
    const floral = await search({ p_family: "Floral", p_page_size: 48 });
    expect(floral.items.every((i) => i.family_group === "Floral")).toBe(true);
    const promo = await search({ p_promo: true, p_page_size: 48 });
    expect(promo.items.every((i) => i.has_promo)).toBe(true);
    const faixa = await search({ p_min_price: 20000, p_max_price: 40000, p_page_size: 48 });
    expect(faixa.items.every((i) => i.min_price_cents >= 20000 && i.min_price_cents <= 40000)).toBe(true);
  });

  it("combina filtros", async () => {
    const r = await search({ p_gender: "masculino", p_origin: "importado", p_max_price: 50000, p_page_size: 48 });
    expect(r.items.every((i) => i.gender === "masculino" && i.origin === "importado" && i.min_price_cents <= 50000)).toBe(true);
  });

  it("ordena por preço crescente e decrescente (grupo 4)", async () => {
    const asc = (await search({ p_sort: "price_asc", p_page_size: 48 })).items.map((i) => i.min_price_cents);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = (await search({ p_sort: "price_desc", p_page_size: 48 })).items.map((i) => i.min_price_cents);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("filtro 'disponível' exclui produtos esgotados", async () => {
    await db.exec("update inventory set on_hand = 0, reserved = 0 where variant_id in (select v.id from product_variants v join products p on p.id = v.product_id where p.seed_key = 'yara')");
    const r = await search({ p_in_stock: true, p_page_size: 48 });
    expect(r.items.find((i) => i.slug === "yara-lattafa")).toBeUndefined();
    expect(r.items.every((i) => i.in_stock)).toBe(true);
  });

  it("todo item tem imagem (Storage ou URL externa documentada) (grupo 48)", async () => {
    const r = await search({ p_page_size: 48 });
    expect(r.items.every((i) => i.image_path || i.image_url)).toBe(true);
  });

  describe("get_product (grupos 6 e 7)", () => {
    it("retorna o produto com marca, variantes ordenadas por volume e imagens", async () => {
      const [{ p }] = await as<{ p: Record<string, unknown> & { variants: { volume_ml: number; stock_status: string }[]; images: unknown[]; brand: { slug: string } } }>(
        db, { role: "anon" }, "select public.get_product('sauvage-dior') p");
      expect(p.brand.slug).toBe("dior");
      const volumes = p.variants.map((v) => v.volume_ml);
      expect(volumes).toEqual([...volumes].sort((a, b) => a - b));
      expect(p.images.length).toBeGreaterThan(0);
      expect(p.variants.every((v) => ["in_stock", "low_stock", "out_of_stock"].includes(v.stock_status))).toBe(true);
      expect(JSON.stringify(p)).not.toContain("on_hand");
    });

    it("produto inexistente retorna null", async () => {
      const [{ p }] = await as<{ p: unknown }>(db, { role: "anon" }, "select public.get_product('nao-existe') p");
      expect(p).toBeNull();
    });

    it("produto arquivado/rascunho retorna null para visitantes", async () => {
      await db.exec("update products set status = 'archived' where seed_key = 'daisy'");
      const [{ p }] = await as<{ p: unknown }>(db, { role: "anon" }, "select public.get_product('daisy-marc-jacobs') p");
      expect(p).toBeNull();
      await db.exec("update products set status = 'published' where seed_key = 'daisy'");
    });

    it("produto sem pirâmide confirmada retorna notas nulas, não inventadas (grupo 49)", async () => {
      const [{ p }] = await as<{ p: { top_notes: unknown; heart_notes: unknown; base_notes: unknown } }>(
        db, { role: "anon" }, "select public.get_product('khamrah-lattafa') p");
      expect(p.top_notes).toBeNull();
      expect(p.heart_notes).toBeNull();
      expect(p.base_notes).toBeNull();
    });
  });

  it("facetas trazem marcas, famílias e faixa de preço", async () => {
    const [{ f }] = await as<{ f: { brands: { slug: string; count: number }[]; families: { name: string }[]; price: { min: number; max: number } } }>(
      db, { role: "anon" }, "select public.catalog_facets() f");
    expect(f.brands.length).toBeGreaterThan(15);
    expect(f.families.map((x) => x.name)).toContain("Floral");
    expect(f.price.min).toBeLessThan(f.price.max);
  });
});
