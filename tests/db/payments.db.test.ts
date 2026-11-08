// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

type EventResult = { duplicate: boolean; result?: string; order_status?: string };
const SR = { role: "service_role" as const };

describe("Banco: pagamentos e webhooks (Fase 8)", () => {
  let db: PGlite;
  let adminId: string;
  let buyerId: string;
  let variantId: string;

  const stock = async () => (await db.query<{ on_hand: number; reserved: number }>("select on_hand, reserved from inventory where variant_id = $1", [variantId])).rows[0];
  const newOrder = async (qty = 1, userId: string | null = null) => {
    await db.query("update inventory set on_hand = 10, reserved = 0 where variant_id = $1", [variantId]);
    const [{ r }] = await as<{ r: { order_id: string; total_cents: number; token: string } }>(db, SR, "select public.create_order($1, $2, $3, $4, $5, 'pix', true) r", [
      randomUUID(), userId, JSON.stringify([{ variant_id: variantId, quantity: qty }]), JSON.stringify({ name: "Ana", email: "ana@example.com" }),
      JSON.stringify({ cep: "01310100", street: "Rua A", number: "1", district: "Centro", city: "São Paulo", state: "SP" }),
    ]);
    return r;
  };
  const charge = (orderId: string, amount: number, method = "pix", ref = `fake_${randomUUID()}`) =>
    as<{ id: string }>(db, SR, "select public.create_payment($1, 'fake', $2, $3, $4, $5) id", [orderId, ref, method, amount, method === "pix" ? "00020126SALLYDEMO" : null]).then(() => ref);
  const event = (type: string, ref: string, amount: number, id = `evt_${randomUUID()}`) =>
    as<{ r: EventResult }>(db, SR, "select public.apply_payment_event('fake', $1, $2, $3, $4, '{}'::jsonb) r", [id, type, ref, amount]).then((r) => r[0].r);
  const orderStatus = async (id: string) => (await db.query<{ status: string }>("select status from orders where id = $1", [id])).rows[0].status;
  const payStatus = async (ref: string) => (await db.query<{ status: string; needs_refund: boolean }>("select status, needs_refund from payments where provider_ref = $1", [ref])).rows[0];

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    adminId = await createUser(db, "admin@sally.test", "admin");
    buyerId = await createUser(db, "comprador@sally.test");
    const { rows } = await db.query<{ id: string }>("select v.id from product_variants v join products p on p.id = v.product_id where p.status = 'published' and v.is_active order by v.sku limit 1");
    variantId = rows[0].id;
  }, 60_000);

  it("pagamento aprovado pelo webhook marca o pedido como pago e baixa o estoque (grupos 35, 36)", async () => {
    const o = await newOrder(2);
    const ref = await charge(o.order_id, o.total_cents);
    expect(await stock()).toEqual({ on_hand: 10, reserved: 2 });
    const r = await event("payment.approved", ref, o.total_cents);
    expect(r).toMatchObject({ duplicate: false, result: "order_paid", order_status: "paid" });
    expect(await stock()).toEqual({ on_hand: 8, reserved: 0 });
    expect((await payStatus(ref)).status).toBe("approved");
  });

  it("o mesmo evento repetido não é aplicado de novo (idempotência, grupo 37)", async () => {
    const o = await newOrder(1);
    const ref = await charge(o.order_id, o.total_cents);
    const id = `evt_${randomUUID()}`;
    await event("payment.approved", ref, o.total_cents, id);
    const again = await event("payment.approved", ref, o.total_cents, id);
    expect(again).toEqual({ duplicate: true });
    expect(await stock()).toEqual({ on_hand: 9, reserved: 0 });
    // Evento novo para cobrança já aprovada também não baixa estoque de novo.
    expect((await event("payment.approved", ref, o.total_cents)).result).toBe("already_approved");
    expect(await stock()).toEqual({ on_hand: 9, reserved: 0 });
  });

  it("valor divergente não paga o pedido: cobrança vai para revisão (grupo 38)", async () => {
    const o = await newOrder(1);
    const ref = await charge(o.order_id, o.total_cents);
    const r = await event("payment.approved", ref, o.total_cents - 1);
    expect(r.result).toBe("amount_mismatch");
    expect(await orderStatus(o.order_id)).toBe("pending_payment");
    expect((await payStatus(ref)).status).toBe("review");
  });

  it("cobrança com valor diferente do pedido nem é criada", async () => {
    const o = await newOrder(1);
    await expect(charge(o.order_id, o.total_cents + 100)).rejects.toThrow(/valor da cobrança/);
  });

  it("recusa mantém o pedido aguardando e permite nova tentativa; só uma cobrança pendente por vez", async () => {
    const o = await newOrder(1);
    const card = await charge(o.order_id, o.total_cents, "card");
    expect((await event("payment.declined", card, o.total_cents)).result).toBe("declined");
    expect(await orderStatus(o.order_id)).toBe("pending_payment");
    const pix1 = await charge(o.order_id, o.total_cents, "pix");
    const pix2 = await charge(o.order_id, o.total_cents, "pix");
    expect((await payStatus(pix1)).status).toBe("canceled");
    expect((await payStatus(pix2)).status).toBe("pending");
    const { rows } = await db.query<{ payment_method: string }>("select payment_method from orders where id = $1", [o.order_id]);
    expect(rows[0].payment_method).toBe("pix");
  });

  it("pagamento que chega depois da reserva expirar fica marcado para estorno, sem baixar estoque", async () => {
    const o = await newOrder(1);
    const ref = await charge(o.order_id, o.total_cents);
    await db.query("update orders set reserved_until = now() - interval '1 minute' where id = $1", [o.order_id]);
    const r = await event("payment.approved", ref, o.total_cents);
    expect(r).toMatchObject({ result: "needs_refund", order_status: "expired" });
    expect(await payStatus(ref)).toEqual({ status: "approved", needs_refund: true });
    expect(await stock()).toEqual({ on_hand: 10, reserved: 0 });
  });

  it("não cria cobrança para pedido pago, cancelado ou expirado", async () => {
    const o = await newOrder(1);
    await as(db, { role: "authenticated", userId: adminId }, "select public.admin_update_order_status($1, 'canceled')", [o.order_id]);
    await expect(charge(o.order_id, o.total_cents)).rejects.toThrow(/PEDIDO_NAO_PENDENTE:canceled/);
  });

  it("cancelar pedido pago estorna a cobrança; cancelar pendente encerra a cobrança aberta (grupo 39)", async () => {
    const paid = await newOrder(1);
    const ref = await charge(paid.order_id, paid.total_cents);
    await event("payment.approved", ref, paid.total_cents);
    await as(db, { role: "authenticated", userId: adminId }, "select public.admin_update_order_status($1, 'canceled')", [paid.order_id]);
    expect((await payStatus(ref)).status).toBe("refunded");

    const pending = await newOrder(1);
    const ref2 = await charge(pending.order_id, pending.total_cents);
    await as(db, { role: "authenticated", userId: adminId }, "select public.admin_update_order_status($1, 'canceled')", [pending.order_id]);
    expect((await payStatus(ref2)).status).toBe("canceled");
  });

  it("evento de tipo desconhecido é recusado e de cobrança desconhecida é só registrado", async () => {
    await expect(event("payment.hacked", "fake_x1234567", 100)).rejects.toThrow(/tipo de evento/);
    expect((await event("payment.approved", "fake_inexistente", 100)).result).toBe("unknown_payment");
  });

  it("visitante e cliente não criam cobrança, não aplicam eventos nem leem eventos (grupo 31)", async () => {
    const o = await newOrder(1, buyerId);
    const ref = await charge(o.order_id, o.total_cents);
    for (const actor of [{ role: "anon" as const }, { role: "authenticated" as const, userId: buyerId }]) {
      await expect(as(db, actor, "select public.apply_payment_event('fake', 'evt_hack_123', 'payment.approved', $1, $2)", [ref, o.total_cents])).rejects.toThrow(/permission denied/);
      await expect(as(db, actor, "select public.create_payment($1, 'fake', 'fake_hack_123', 'pix', $2)", [o.order_id, o.total_cents])).rejects.toThrow(/permission denied/);
    }
    // O dono do pedido vê a cobrança; não vê eventos brutos do provedor.
    expect((await as(db, { role: "authenticated", userId: buyerId }, "select id from payments")).length).toBe(1);
    expect(await as(db, { role: "authenticated", userId: buyerId }, "select id from payment_events")).toEqual([]);
  });

  it("o link do pedido mostra a cobrança pendente (código Pix) e esconde o código depois de pago", async () => {
    const o = await newOrder(1);
    const ref = await charge(o.order_id, o.total_cents);
    let [{ p }] = await as<{ p: { payment: { status: string; pix_code: string | null } } }>(db, { role: "anon" }, "select public.get_order_public($1) p", [o.token]);
    expect(p.payment).toMatchObject({ status: "pending", pix_code: "00020126SALLYDEMO" });
    await event("payment.approved", ref, o.total_cents);
    [{ p }] = await as(db, { role: "anon" }, "select public.get_order_public($1) p", [o.token]);
    expect(p.payment).toMatchObject({ status: "approved", pix_code: null });
  });
});
