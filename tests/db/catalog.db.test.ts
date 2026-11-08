// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

type Count = { n: number };
const count = async (db: PGlite, sql: string) => Number((await db.query<Count>(sql)).rows[0].n);

describe("Banco: migrations + seed do catálogo (Postgres real via PGlite)", () => {
  let db: PGlite;
  let adminId: string;
  let customerId: string;

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    adminId = await createUser(db, "dono@sally.test", "owner");
    customerId = await createUser(db, "cliente@sally.test");
  }, 60_000);

  describe("carga inicial (grupo 45)", () => {
    it("carrega pelo menos 40 produtos publicados, com variantes, estoque e imagens", async () => {
      const products = await count(db, "select count(*) n from products where status = 'published'");
      expect(products).toBeGreaterThanOrEqual(40);
      expect(await count(db, "select count(*) n from products p where not exists (select 1 from product_variants v where v.product_id = p.id)")).toBe(0);
      expect(await count(db, "select count(*) n from product_variants v where not exists (select 1 from inventory i where i.variant_id = v.id)")).toBe(0);
      expect(await count(db, "select count(*) n from products p where not exists (select 1 from product_images i where i.product_id = p.id and i.is_primary)")).toBe(0);
    });

    it("todo estoque inicial é marcado como demonstração e tem movimentação 'seed' (grupo 50)", async () => {
      expect(await count(db, "select count(*) n from inventory where not is_demo_quantity")).toBe(0);
      expect(await count(db, "select count(*) n from inventory i where i.on_hand > 0 and not exists (select 1 from inventory_movements m where m.variant_id = i.variant_id and m.type = 'seed')")).toBe(0);
    });

    it("todo preço é de referência e todo produto está pendente de revisão comercial", async () => {
      expect(await count(db, "select count(*) n from product_variants where not price_is_reference")).toBe(0);
      expect(await count(db, "select count(*) n from products where commercial_review <> 'pending'")).toBe(0);
    });

    it("executar o seed de novo não duplica nada (idempotência)", async () => {
      const before = await db.query<Record<string, number>>(
        "select (select count(*) from products) p, (select count(*) from product_variants) v, (select count(*) from product_images) i, (select count(*) from inventory_movements) m, (select count(*) from brands) b",
      );
      await db.exec(seedSql());
      await db.exec(seedSql());
      const after = await db.query<Record<string, number>>(
        "select (select count(*) from products) p, (select count(*) from product_variants) v, (select count(*) from product_images) i, (select count(*) from inventory_movements) m, (select count(*) from brands) b",
      );
      expect(after.rows[0]).toEqual(before.rows[0]);
    });

    it("reexecutar o seed preserva preço confirmado e estoque real definidos pelo proprietário", async () => {
      await db.exec(`
        update product_variants set price_cents = 12345, compare_at_cents = null, price_is_reference = false where sku = 'SLY-LA-VIE-EST-BELLE-030';
        update inventory set on_hand = 99, is_demo_quantity = false
          where variant_id = (select id from product_variants where sku = 'SLY-LA-VIE-EST-BELLE-030');`);
      await db.exec(seedSql());
      const { rows } = await db.query<{ price_cents: number; on_hand: number; is_demo_quantity: boolean }>(
        `select v.price_cents, i.on_hand, i.is_demo_quantity from product_variants v join inventory i on i.variant_id = v.id where v.sku = 'SLY-LA-VIE-EST-BELLE-030'`,
      );
      expect(rows[0]).toEqual({ price_cents: 12345, on_hand: 99, is_demo_quantity: false });
    });
  });

  describe("constraints de integridade", () => {
    it("rejeita estoque negativo e reserva maior que o disponível", async () => {
      await expect(db.exec("update inventory set on_hand = -1 where variant_id = (select id from product_variants limit 1)")).rejects.toThrow();
      await expect(db.exec("update inventory set reserved = on_hand + 1 where variant_id = (select id from product_variants limit 1)")).rejects.toThrow();
    });

    it("rejeita preço promocional maior ou igual ao preço 'de' e preço não positivo", async () => {
      await expect(db.exec("update product_variants set compare_at_cents = price_cents where sku = 'SLY-SAUVAGE-EDT-100'")).rejects.toThrow();
      await expect(db.exec("update product_variants set price_cents = 0 where sku = 'SLY-SAUVAGE-EDT-100'")).rejects.toThrow();
    });

    it("SKU e slug são únicos", async () => {
      await expect(
        db.exec("insert into product_variants (product_id, sku, price_cents) select product_id, sku, 100 from product_variants limit 1"),
      ).rejects.toThrow();
    });
  });

  describe("RLS e autorização no banco (grupos 35–37)", () => {
    it("visitante vê o catálogo publicado pela view, mas nunca as quantidades de estoque", async () => {
      const rows = await as<{ n: number }>(db, { role: "anon" }, "select count(*)::int n from catalog_products");
      expect(rows[0].n).toBeGreaterThanOrEqual(40);
      const status = await as<{ stock_status: string }>(db, { role: "anon" }, "select stock_status from inventory limit 1");
      expect(["in_stock", "low_stock", "out_of_stock"]).toContain(status[0].stock_status);
      await expect(as(db, { role: "anon" }, "select on_hand from inventory limit 1")).rejects.toThrow(/permission denied/);
    });

    it("produto em rascunho não aparece para visitantes nem clientes, mas aparece para o admin", async () => {
      await db.exec("update products set status = 'draft' where seed_key = 'khamrah'");
      const anon = await as(db, { role: "anon" }, "select 1 from catalog_products where slug like 'khamrah%'");
      const customer = await as(db, { role: "authenticated", userId: customerId }, "select 1 from products where seed_key = 'khamrah'");
      const admin = await as(db, { role: "authenticated", userId: adminId }, "select 1 from products where seed_key = 'khamrah'");
      expect(anon).toHaveLength(0);
      expect(customer).toHaveLength(0);
      expect(admin).toHaveLength(1);
      await db.exec("update products set status = 'published' where seed_key = 'khamrah'");
    });

    it("cliente não consegue alterar preço nem criar produto (grupo: alteração de preço sem autorização)", async () => {
      const updated = await as<{ sku: string }>(
        db,
        { role: "authenticated", userId: customerId },
        "update product_variants set price_cents = 1 where sku = 'SLY-SAUVAGE-EDT-100' returning sku",
      );
      expect(updated).toHaveLength(0);
      const price = await count(db, "select price_cents n from product_variants where sku = 'SLY-SAUVAGE-EDT-100'");
      expect(price).toBeGreaterThan(1);
      await expect(
        as(db, { role: "anon" }, "insert into brands (name, slug) values ('Falsa', 'falsa')"),
      ).rejects.toThrow(/row-level security/);
    });

    it("cliente não consegue alterar estoque (grupo: alteração de estoque sem autorização)", async () => {
      await expect(
        as(db, { role: "authenticated", userId: customerId }, "update inventory set on_hand = 1000"),
      ).rejects.toThrow(/permission denied/);
    });

    it("cliente não consegue se promover a admin (escalonamento de privilégio)", async () => {
      await expect(
        as(db, { role: "authenticated", userId: customerId }, "insert into user_roles (user_id, role) values ($1, 'admin')", [customerId]),
      ).rejects.toThrow(/permission denied/);
      const isAdmin = await as<{ has_role: boolean }>(db, { role: "authenticated", userId: customerId }, "select public.has_role('admin')");
      expect(isAdmin[0].has_role).toBe(false);
    });

    it("cliente só enxerga os próprios papéis; owner herda permissões de admin", async () => {
      const own = await as(db, { role: "authenticated", userId: customerId }, "select * from user_roles");
      expect(own).toHaveLength(0);
      const owner = await as<{ has_role: boolean }>(db, { role: "authenticated", userId: adminId }, "select public.has_role('admin')");
      expect(owner[0].has_role).toBe(true);
    });

    it("admin consegue atualizar preço via RLS", async () => {
      const rows = await as<{ price_cents: number }>(
        db,
        { role: "authenticated", userId: adminId },
        "update product_variants set price_cents = price_cents where sku = 'SLY-SAUVAGE-EDT-100' returning price_cents",
      );
      expect(rows).toHaveLength(1);
    });

    it("movimentações de estoque são invisíveis para clientes", async () => {
      const rows = await as(db, { role: "authenticated", userId: customerId }, "select * from inventory_movements");
      expect(rows).toHaveLength(0);
    });
  });

  describe("view catalog_products", () => {
    it("calcula preço mínimo, promoção e disponibilidade corretamente", async () => {
      const [view] = await as<{ min_price_cents: number; has_promo: boolean; in_stock: boolean; variant_count: number }>(
        db, { role: "anon" }, "select min_price_cents, has_promo, in_stock, variant_count from catalog_products where slug = 'sauvage-dior'");
      const raw = await db.query<{ min: number; promo: boolean; n: number }>(
        "select min(price_cents)::int min, bool_or(compare_at_cents is not null) promo, count(*)::int n from product_variants v join products p on p.id = v.product_id where p.seed_key = 'sauvage-edt'");
      expect(view.min_price_cents).toBe(raw.rows[0].min);
      expect(view.has_promo).toBe(raw.rows[0].promo);
      expect(view.variant_count).toBe(raw.rows[0].n);
    });

    it("produto com todas as variantes esgotadas aparece como indisponível (grupo 23)", async () => {
      await db.exec("update inventory set on_hand = 0, reserved = 0 where variant_id in (select v.id from product_variants v join products p on p.id = v.product_id where p.seed_key = 'asad')");
      const [row] = await as<{ in_stock: boolean }>(db, { role: "anon" }, "select in_stock from catalog_products where slug = 'asad-lattafa'");
      expect(row.in_stock).toBe(false);
    });

    it("busca normalizada ignora acentos (Idôle → idole)", async () => {
      const rows = await as(db, { role: "anon" }, "select slug from catalog_products where search_text like '%' || public.normalize_search('idole') || '%'");
      expect(rows.length).toBeGreaterThanOrEqual(1);
    });
  });
});
