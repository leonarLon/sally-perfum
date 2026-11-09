// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

type Stock = { on_hand: number; reserved: number; min_stock: number; stock_status: string; is_demo_quantity: boolean; delta: number };

describe("Banco: painel administrativo (Fase 5)", () => {
  let db: PGlite;
  let ownerId: string;
  let adminId: string;
  let customerId: string;
  let variantId: string;
  let productId: string;

  const admin = () => ({ role: "authenticated" as const, userId: adminId });
  const customer = () => ({ role: "authenticated" as const, userId: customerId });
  const updateStock = (actor: Parameters<typeof as>[1], mode: string, qty: number, min = 3, reason = "Contagem do teste") =>
    as<{ r: Stock }>(db, actor, "select public.admin_update_stock($1, $2, $3, $4, $5) r", [variantId, mode, qty, min, reason]).then((rows) => rows[0].r);

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    ownerId = await createUser(db, "dono@sally.test", "owner");
    adminId = await createUser(db, "admin@sally.test", "admin");
    customerId = await createUser(db, "cliente@sally.test");
    const { rows } = await db.query<{ id: string; product_id: string }>(
      "select v.id, v.product_id from product_variants v join inventory i on i.variant_id = v.id where i.on_hand > 5 order by v.sku limit 1",
    );
    variantId = rows[0].id;
    productId = rows[0].product_id;
  }, 60_000);

  describe("estoque", () => {
    it("admin confere a contagem: grava quantidade real, movimento 'adjust' com autor e deixa de ser demo", async () => {
      const r = await updateStock(admin(), "set", 12, 2);
      expect(r).toMatchObject({ on_hand: 12, min_stock: 2, stock_status: "in_stock", is_demo_quantity: false });
      const mov = await db.query<{ type: string; quantity: number; actor_id: string; reason: string }>(
        "select type, quantity, actor_id, reason from inventory_movements where variant_id = $1 order by id desc limit 1",
        [variantId],
      );
      expect(mov.rows[0]).toMatchObject({ type: "adjust", actor_id: adminId, reason: "Contagem do teste" });
      expect(mov.rows[0].quantity).toBe(r.delta);
    });

    it("entrada de mercadoria soma ao estoque e registra movimento 'in'", async () => {
      const r = await updateStock(admin(), "in", 5, 2, "Nota fiscal 123");
      expect(r.on_hand).toBe(17);
      expect(r.delta).toBe(5);
      const mov = await db.query<{ type: string }>("select type from inventory_movements where variant_id = $1 order by id desc limit 1", [variantId]);
      expect(mov.rows[0].type).toBe("in");
    });

    it("status baixo/esgotado segue o estoque mínimo", async () => {
      expect((await updateStock(admin(), "set", 2, 2)).stock_status).toBe("low_stock");
      expect((await updateStock(admin(), "set", 0, 2)).stock_status).toBe("out_of_stock");
      await updateStock(admin(), "set", 10, 3);
    });

    it("nunca deixa o estoque abaixo do reservado", async () => {
      await db.query("update inventory set reserved = 4 where variant_id = $1", [variantId]);
      await expect(updateStock(admin(), "set", 3)).rejects.toThrow(/abaixo da reservada/);
      await db.query("update inventory set reserved = 0 where variant_id = $1", [variantId]);
    });

    it("rejeita entradas inválidas (quantidade negativa, entrada zero, sem motivo, modo desconhecido)", async () => {
      await expect(updateStock(admin(), "set", -1)).rejects.toThrow(/quantidade inválida/);
      await expect(updateStock(admin(), "in", 0)).rejects.toThrow(/quantidade inválida/);
      await expect(updateStock(admin(), "set", 5, 3, "  ")).rejects.toThrow(/motivo/);
      await expect(updateStock(admin(), "zerar", 5)).rejects.toThrow(/modo inválido/);
    });

    it("cliente e visitante não alteram estoque nem leem quantidades", async () => {
      await expect(updateStock(customer(), "set", 999)).rejects.toThrow(/permissão negada/);
      await expect(updateStock({ role: "anon" }, "set", 999)).rejects.toThrow(/permission denied/);
      await expect(as(db, customer(), "select * from public.admin_list_inventory()")).rejects.toThrow(/permissão negada/);
      await expect(as(db, { role: "anon" }, "select * from public.admin_list_inventory()")).rejects.toThrow(/permission denied/);
      await expect(as(db, customer(), "update inventory set on_hand = 999")).rejects.toThrow(/permission denied/);
      const onHand = await db.query<{ on_hand: number }>("select on_hand from inventory where variant_id = $1", [variantId]);
      expect(onHand.rows[0].on_hand).toBe(10);
    });

    it("cria a linha de estoque de uma variante nova criada pelo painel", async () => {
      const [v] = await as<{ id: string }>(
        db,
        admin(),
        "insert into product_variants (product_id, sku, volume_ml, price_cents) values ($1, 'SLY-TESTE-NOVA-999', 999, 10000) returning id",
        [productId],
      );
      const [r] = await as<{ r: Stock }>(db, admin(), "select public.admin_update_stock($1, 'in', 7, 3, 'Primeira entrada') r", [v.id]);
      expect(r.r).toMatchObject({ on_hand: 7, is_demo_quantity: false });
    });

    it("admin lista o estoque com quantidades e filtro por status", async () => {
      const all = await as<{ sku: string; on_hand: number }>(db, admin(), "select * from public.admin_list_inventory()");
      expect(all.length).toBeGreaterThan(100);
      const out = await as<{ stock_status: string }>(db, admin(), "select * from public.admin_list_inventory(null, 'out_of_stock')");
      expect(out.every((r) => r.stock_status === "out_of_stock")).toBe(true);
      const bySku = await as<{ sku: string }>(db, admin(), "select * from public.admin_list_inventory('SLY-TESTE-NOVA')");
      expect(bySku.map((r) => r.sku)).toEqual(["SLY-TESTE-NOVA-999"]);
    });
  });

  describe("auditoria", () => {
    it("registra quem alterou o quê, só com os campos que mudaram", async () => {
      await as(db, admin(), "update products set name = name || ' (editado)', featured = featured where id = $1", [productId]);
      const { rows } = await db.query<{ actor_id: string; action: string; changes: Record<string, { de: string; para: string }> }>(
        "select actor_id, action, changes from audit_logs where entity = 'products' and entity_id = $1 order by id desc limit 1",
        [productId],
      );
      expect(rows[0].actor_id).toBe(adminId);
      expect(rows[0].action).toBe("update");
      expect(Object.keys(rows[0].changes)).toEqual(["name"]);
      expect(rows[0].changes.name.para).toMatch(/\(editado\)$/);
    });

    it("alteração de preço e de estoque também ficam auditadas", async () => {
      await as(db, admin(), "update product_variants set price_cents = price_cents + 100, price_is_reference = false where id = $1", [variantId]);
      const n = await db.query<{ n: number }>(
        "select count(*)::int n from audit_logs where entity in ('product_variants', 'inventory') and entity_id = $1 and actor_id = $2",
        [variantId, adminId],
      );
      expect(n.rows[0].n).toBeGreaterThanOrEqual(2);
    });

    it("atualização sem mudança real não gera registro", async () => {
      const before = await db.query<{ n: number }>("select count(*)::int n from audit_logs");
      await as(db, admin(), "update products set featured = featured where id = $1", [productId]);
      const after = await db.query<{ n: number }>("select count(*)::int n from audit_logs");
      expect(after.rows[0].n).toBe(before.rows[0].n);
    });

    it("é somente leitura: nem admin altera ou apaga; cliente e visitante não leem", async () => {
      await expect(as(db, admin(), "delete from audit_logs")).rejects.toThrow(/permission denied/);
      await expect(as(db, admin(), "update audit_logs set actor_id = null")).rejects.toThrow(/permission denied/);
      await expect(as(db, admin(), "insert into audit_logs (action, entity, entity_id) values ('update', 'x', 'y')")).rejects.toThrow(/permission denied/);
      expect((await as(db, admin(), "select id from audit_logs limit 1")).length).toBe(1);
      expect(await as(db, customer(), "select id from audit_logs")).toEqual([]);
      await expect(as(db, { role: "anon" }, "select id from audit_logs")).rejects.toThrow(/permission denied/);
    });

    it("concessão de papel fica registrada", async () => {
      const newId = await createUser(db, "novo-admin@sally.test", "admin");
      const { rows } = await db.query<{ n: number }>("select count(*)::int n from audit_logs where entity = 'user_roles' and entity_id = $1", [newId]);
      expect(rows[0].n).toBe(1);
    });
  });

  describe("produtos e imagens pelo painel", () => {
    it("owner herda as permissões de admin", async () => {
      const r = await as<{ r: Stock }>(db, { role: "authenticated", userId: ownerId }, "select public.admin_update_stock($1, 'in', 1, 3, 'Teste do dono') r", [variantId]);
      expect(r[0].r.delta).toBe(1);
    });

    it("cliente não edita produto, preço nem imagem (a RLS ignora a escrita)", async () => {
      await as(db, customer(), "update products set name = 'hack' where id = $1", [productId]);
      await as(db, customer(), "update product_variants set price_cents = 1 where id = $1", [variantId]);
      const { rows } = await db.query<{ name: string; price_cents: number }>(
        "select p.name, v.price_cents from products p join product_variants v on v.product_id = p.id where v.id = $1",
        [variantId],
      );
      expect(rows[0].name).not.toBe("hack");
      expect(rows[0].price_cents).toBeGreaterThan(1);
    });

    it("troca a imagem principal de forma atômica e bloqueia cliente", async () => {
      const imgs = await db.query<{ id: string; is_primary: boolean }>(
        "select id, is_primary from product_images where product_id = (select product_id from product_images group by product_id having count(*) > 1 limit 1) order by position",
      );
      const secondary = imgs.rows.find((i) => !i.is_primary)!;
      await expect(as(db, customer(), "select public.admin_set_primary_image($1)", [secondary.id])).rejects.toThrow(/permissão negada/);
      await as(db, admin(), "select public.admin_set_primary_image($1)", [secondary.id]);
      const after = await db.query<{ id: string }>("select id from product_images where id = any($1) and is_primary", [imgs.rows.map((i) => i.id)]);
      expect(after.rows.map((r) => r.id)).toEqual([secondary.id]);
    });

    it("painel vê rascunhos; visitante não", async () => {
      await as(db, admin(), "update products set status = 'draft' where id = $1", [productId]);
      expect((await as(db, admin(), "select id from products where id = $1", [productId])).length).toBe(1);
      expect((await as(db, { role: "anon" }, "select id from products where id = $1", [productId])).length).toBe(0);
      await as(db, admin(), "update products set status = 'published' where id = $1", [productId]);
    });

    it("indicadores do painel só para admin", async () => {
      const [s] = await as<{ s: Record<string, number> }>(db, admin(), "select public.admin_dashboard_stats() s");
      expect(s.s.products_published).toBeGreaterThanOrEqual(40);
      expect(s.s).toHaveProperty("demo_stock");
      await expect(as(db, customer(), "select public.admin_dashboard_stats()")).rejects.toThrow(/permissão negada/);
    });
  });
});
