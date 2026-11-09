// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

type Created = { order_id: string; number: number; token: string; total_cents: number; replayed: boolean };
type Stock = { on_hand: number; reserved: number };

const customer = { name: "Maria Teste", email: "Maria@Example.com", phone: "(11) 98765-4321" };
const address = { cep: "01310-100", street: "Av. Paulista", number: "1000", complement: "", district: "Bela Vista", city: "São Paulo", state: "sp" };

describe("Banco: pedidos, reserva de estoque e checkout (Fase 6)", () => {
  let db: PGlite;
  let adminId: string;
  let buyerId: string;
  let otherId: string;
  let variant: { id: string; sku: string; price_cents: number };
  let variant2: { id: string; sku: string; price_cents: number };

  const stock = async (id: string) =>
    (await db.query<Stock>("select on_hand, reserved from inventory where variant_id = $1", [id])).rows[0];
  const setStock = (id: string, onHand: number) => db.query("update inventory set on_hand = $2, reserved = 0 where variant_id = $1", [id, onHand]);
  const order = (items: unknown, opts: { key?: string; userId?: string | null; cep?: string; privacy?: boolean; actor?: Parameters<typeof as>[1] } = {}) =>
    as<{ r: Created }>(db, opts.actor ?? { role: "service_role" }, "select public.create_order($1, $2, $3, $4, $5, $6, $7) r", [
      opts.key ?? randomUUID(),
      opts.userId ?? null,
      JSON.stringify(items),
      JSON.stringify(customer),
      JSON.stringify({ ...address, cep: opts.cep ?? address.cep }),
      "pix",
      opts.privacy ?? true,
    ]).then((rows) => rows[0].r);
  const adminStatus = (orderId: string, status: string, actorId = adminId) =>
    as<{ r: string }>(db, { role: "authenticated", userId: actorId }, "select public.admin_update_order_status($1, $2) r", [orderId, status]).then((r) => r[0].r);

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    adminId = await createUser(db, "admin@sally.test", "admin");
    buyerId = await createUser(db, "comprador@sally.test");
    otherId = await createUser(db, "outro@sally.test");
    const { rows } = await db.query<{ id: string; sku: string; price_cents: number }>(
      "select v.id, v.sku, v.price_cents from product_variants v join products p on p.id = v.product_id where p.status = 'published' and v.is_active order by v.sku limit 2",
    );
    [variant, variant2] = rows;
  }, 60_000);

  describe("cotação da sacola", () => {
    it("usa o preço do banco, limita pela disponibilidade e calcula frete por CEP", async () => {
      await setStock(variant.id, 3);
      const [{ q }] = await as<{ q: { lines: { quantity: number; max_qty: number; price_cents: number; line_total_cents: number }[]; subtotal_cents: number; shipping: { price_cents: number; label: string } } }>(
        db, { role: "anon" }, "select public.quote_cart($1, $2) q", [JSON.stringify([{ variant_id: variant.id, quantity: 5 }]), "01310-100"]);
      expect(q.lines[0]).toMatchObject({ quantity: 3, max_qty: 3, price_cents: variant.price_cents, line_total_cents: variant.price_cents * 3 });
      expect(q.subtotal_cents).toBe(variant.price_cents * 3);
      expect(q.shipping.label).toMatch(/São Paulo/);
    });

    it("frete grátis acima do valor mínimo e CEP inválido sem frete", async () => {
      const [{ f }] = await as<{ f: { free: boolean; price_cents: number } }>(db, { role: "anon" }, "select public.shipping_quote('90000000', 50000) f");
      expect(f).toMatchObject({ free: true, price_cents: 0 });
      const [{ g }] = await as<{ g: null }>(db, { role: "anon" }, "select public.shipping_quote('123', 1000) g");
      expect(g).toBeNull();
    });

    it("item inexistente aparece como indisponível, sem quebrar a sacola", async () => {
      const [{ q }] = await as<{ q: { lines: { available: boolean; quantity: number }[]; subtotal_cents: number } }>(
        db, { role: "anon" }, "select public.quote_cart($1) q", [JSON.stringify([{ variant_id: randomUUID(), quantity: 1 }])]);
      expect(q.lines[0]).toMatchObject({ available: false, quantity: 0 });
      expect(q.subtotal_cents).toBe(0);
    });
  });

  describe("criação do pedido", () => {
    it("cria pedido com preço do banco, reserva o estoque e registra movimento e histórico", async () => {
      await setStock(variant.id, 10);
      const r = await order([{ variant_id: variant.id, quantity: 2, price_cents: 1 }]); // preço enviado é ignorado
      expect(r.replayed).toBe(false);
      expect(r.token).toMatch(/^[0-9a-f]{64}$/);
      const { rows } = await db.query<{ subtotal_cents: number; shipping_cents: number; total_cents: number; customer_email: string; ship_state: string; customer_phone: string; status: string }>(
        "select subtotal_cents, shipping_cents, total_cents, customer_email, ship_state, customer_phone, status from orders where id = $1", [r.order_id]);
      expect(rows[0]).toMatchObject({ subtotal_cents: variant.price_cents * 2, customer_email: "maria@example.com", ship_state: "SP", customer_phone: "11987654321", status: "pending_payment" });
      expect(rows[0].total_cents).toBe(rows[0].subtotal_cents + rows[0].shipping_cents);
      expect(await stock(variant.id)).toEqual({ on_hand: 10, reserved: 2 });
      const mov = await db.query<{ type: string; quantity: number }>("select type, quantity from inventory_movements where order_id = $1", [r.order_id]);
      expect(mov.rows).toEqual([{ type: "reserve", quantity: -2 }]);
    });

    it("é idempotente: a mesma chave devolve o mesmo pedido sem reservar de novo", async () => {
      await setStock(variant.id, 10);
      const key = randomUUID();
      const a = await order([{ variant_id: variant.id, quantity: 1 }], { key });
      const b = await order([{ variant_id: variant.id, quantity: 1 }], { key });
      expect(b).toMatchObject({ order_id: a.order_id, replayed: true });
      expect((await stock(variant.id)).reserved).toBe(1);
    });

    it("nunca vende além do disponível, contando as reservas de outros pedidos", async () => {
      await setStock(variant.id, 3);
      await order([{ variant_id: variant.id, quantity: 2 }]);
      await expect(order([{ variant_id: variant.id, quantity: 2 }])).rejects.toThrow(/ESTOQUE_INSUFICIENTE:.*:1/);
      expect(await stock(variant.id)).toEqual({ on_hand: 3, reserved: 2 });
    });

    it("pedido com vários itens é tudo ou nada", async () => {
      await setStock(variant.id, 5);
      await setStock(variant2.id, 0);
      await expect(order([{ variant_id: variant.id, quantity: 1 }, { variant_id: variant2.id, quantity: 1 }])).rejects.toThrow(/ESTOQUE_INSUFICIENTE/);
      expect((await stock(variant.id)).reserved).toBe(0);
    });

    it("soma linhas repetidas da mesma variante", async () => {
      await setStock(variant.id, 5);
      const r = await order([{ variant_id: variant.id, quantity: 1 }, { variant_id: variant.id, quantity: 2 }]);
      const { rows } = await db.query<{ quantity: number }>("select quantity from order_items where order_id = $1", [r.order_id]);
      expect(rows).toEqual([{ quantity: 3 }]);
    });

    it("recusa produto não publicado, sacola inválida, CEP inválido, quantidade fora do limite e sem consentimento", async () => {
      await setStock(variant.id, 50);
      await db.query("update products set status = 'draft' where id = (select product_id from product_variants where id = $1)", [variant2.id]);
      await expect(order([{ variant_id: variant2.id, quantity: 1 }])).rejects.toThrow(/ITEM_INDISPONIVEL/);
      await db.query("update products set status = 'published' where id = (select product_id from product_variants where id = $1)", [variant2.id]);
      await expect(order([])).rejects.toThrow(/sacola vazia/);
      await expect(order([{ variant_id: "x", quantity: 1 }])).rejects.toThrow(/sacola inválida/);
      await expect(order([{ variant_id: variant.id, quantity: 1 }], { cep: "123" })).rejects.toThrow(/CEP inválido/);
      await expect(order([{ variant_id: variant.id, quantity: 11 }])).rejects.toThrow(/quantidade por item/);
      await expect(order([{ variant_id: variant.id, quantity: 1 }], { privacy: false })).rejects.toThrow(/política de privacidade/);
    });

    it("visitante e cliente não chamam create_order direto (só o servidor)", async () => {
      await expect(order([{ variant_id: variant.id, quantity: 1 }], { actor: { role: "anon" } })).rejects.toThrow(/permission denied/);
      await expect(order([{ variant_id: variant.id, quantity: 1 }], { actor: { role: "authenticated", userId: buyerId } })).rejects.toThrow(/permission denied/);
    });
  });

  describe("reserva expirada", () => {
    it("libera o estoque do pedido vencido antes do próximo pedido", async () => {
      await setStock(variant.id, 2);
      const old = await order([{ variant_id: variant.id, quantity: 2 }]);
      await db.query("update orders set reserved_until = now() - interval '1 minute' where id = $1", [old.order_id]);
      const r = await order([{ variant_id: variant.id, quantity: 2 }]);
      expect(r.replayed).toBe(false);
      const { rows } = await db.query<{ status: string }>("select status from orders where id = $1", [old.order_id]);
      expect(rows[0].status).toBe("expired");
      expect(await stock(variant.id)).toEqual({ on_hand: 2, reserved: 2 });
      const rel = await db.query<{ type: string; quantity: number }>("select type, quantity from inventory_movements where order_id = $1 order by id", [old.order_id]);
      expect(rel.rows.map((m) => m.type)).toEqual(["reserve", "release"]);
    });
  });

  describe("status do pedido pelo painel", () => {
    it("pago baixa o estoque físico e a reserva; enviado e entregue não mexem no estoque", async () => {
      await setStock(variant.id, 5);
      const r = await order([{ variant_id: variant.id, quantity: 2 }]);
      expect(await adminStatus(r.order_id, "paid")).toBe("paid");
      expect(await stock(variant.id)).toEqual({ on_hand: 3, reserved: 0 });
      await adminStatus(r.order_id, "shipped");
      await adminStatus(r.order_id, "delivered");
      expect(await stock(variant.id)).toEqual({ on_hand: 3, reserved: 0 });
      const ev = await db.query<{ to_status: string }>("select to_status from order_events where order_id = $1 order by id", [r.order_id]);
      expect(ev.rows.map((e) => e.to_status)).toEqual(["pending_payment", "paid", "shipped", "delivered"]);
    });

    it("cancelar antes do pagamento libera a reserva; depois do pagamento devolve ao estoque", async () => {
      await setStock(variant.id, 5);
      const a = await order([{ variant_id: variant.id, quantity: 2 }]);
      await adminStatus(a.order_id, "canceled");
      expect(await stock(variant.id)).toEqual({ on_hand: 5, reserved: 0 });
      const b = await order([{ variant_id: variant.id, quantity: 2 }]);
      await adminStatus(b.order_id, "paid");
      await adminStatus(b.order_id, "canceled");
      expect(await stock(variant.id)).toEqual({ on_hand: 5, reserved: 0 });
    });

    it("bloqueia transições inválidas e pedido vencido não pode ser pago", async () => {
      await setStock(variant.id, 5);
      const r = await order([{ variant_id: variant.id, quantity: 1 }]);
      await expect(adminStatus(r.order_id, "delivered")).rejects.toThrow(/transição inválida/);
      await db.query("update orders set reserved_until = now() - interval '1 minute' where id = $1", [r.order_id]);
      await expect(adminStatus(r.order_id, "paid")).rejects.toThrow(/transição inválida: expired/);
    });

    it("painel expira reservas vencidas sob demanda; cliente não pode", async () => {
      await setStock(variant.id, 3);
      const r = await order([{ variant_id: variant.id, quantity: 3 }]);
      await db.query("update orders set reserved_until = now() - interval '1 minute' where id = $1", [r.order_id]);
      await expect(as(db, { role: "authenticated", userId: buyerId }, "select public.admin_release_expired_reservations()")).rejects.toThrow(/permissão negada/);
      const [{ n }] = await as<{ n: number }>(db, { role: "authenticated", userId: adminId }, "select public.admin_release_expired_reservations() n");
      expect(n).toBeGreaterThanOrEqual(1);
      expect(await stock(variant.id)).toEqual({ on_hand: 3, reserved: 0 });
    });

    it("cliente não muda status", async () => {
      await setStock(variant.id, 5);
      const r = await order([{ variant_id: variant.id, quantity: 1 }]);
      await expect(adminStatus(r.order_id, "paid", buyerId)).rejects.toThrow(/permissão negada/);
    });
  });

  describe("acesso aos pedidos", () => {
    it("link com token mostra o pedido sem dados sensíveis; token errado não mostra nada", async () => {
      await setStock(variant.id, 5);
      const r = await order([{ variant_id: variant.id, quantity: 1 }]);
      const [{ o }] = await as<{ o: Record<string, unknown> }>(db, { role: "anon" }, "select public.get_order_public($1) o", [r.token]);
      expect(o).toMatchObject({ number: r.number, status: "pending_payment", ship_cep_masked: "013**-***" });
      expect(o).not.toHaveProperty("user_id");
      expect(o).not.toHaveProperty("ship_street");
      expect(JSON.stringify(o)).not.toContain(r.token);
      const [{ x }] = await as<{ x: null }>(db, { role: "anon" }, "select public.get_order_public($1) x", ["f".repeat(64)]);
      expect(x).toBeNull();
      const [{ y }] = await as<{ y: null }>(db, { role: "anon" }, "select public.get_order_public($1) y", ["' or 1=1 --"]);
      expect(y).toBeNull();
    });

    it("cliente vê só os próprios pedidos e nunca o token; visitante não lê a tabela", async () => {
      await setStock(variant.id, 5);
      const mine = await order([{ variant_id: variant.id, quantity: 1 }], { userId: buyerId });
      await order([{ variant_id: variant.id, quantity: 1 }], { userId: otherId });
      const rows = await as<{ id: string }>(db, { role: "authenticated", userId: buyerId }, "select id from orders");
      expect(rows.map((r) => r.id)).toEqual([mine.order_id]);
      const items = await as<{ order_id: string }>(db, { role: "authenticated", userId: buyerId }, "select order_id from order_items");
      expect(new Set(items.map((i) => i.order_id))).toEqual(new Set([mine.order_id]));
      await expect(as(db, { role: "authenticated", userId: buyerId }, "select public_token from orders")).rejects.toThrow(/permission denied/);
      await expect(as(db, { role: "anon" }, "select id from orders")).rejects.toThrow(/permission denied/);
      await expect(as(db, { role: "authenticated", userId: buyerId }, "update orders set total_cents = 1")).rejects.toThrow(/permission denied/);
    });

    it("admin vê todos os pedidos e os indicadores incluem pedidos", async () => {
      const rows = await as<{ id: string }>(db, { role: "authenticated", userId: adminId }, "select id from orders");
      expect(rows.length).toBeGreaterThan(5);
      const [{ s }] = await as<{ s: Record<string, number> }>(db, { role: "authenticated", userId: adminId }, "select public.admin_dashboard_stats() s");
      expect(s.orders_total).toBe(rows.length);
      expect(s.revenue_paid_cents).toBeGreaterThan(0);
    });
  });
});
