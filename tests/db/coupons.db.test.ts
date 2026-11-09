// @vitest-environment node
import type { PGlite } from "@electric-sql/pglite";
import { randomUUID } from "node:crypto";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { as, createTestDb, createUser, seedSql } from "./harness";

type Created = { order_id: string; number: number; token: string; total_cents: number };
type CouponQuote = {
  subtotal_cents: number;
  discount_cents: number;
  coupon: { ok: boolean; error?: string; code?: string; discount_cents?: number } | null;
  shipping: { price_cents: number; free: boolean } | null;
};

const customer = { name: "Maria Teste", email: "maria@example.com" };
const address = { cep: "01310-100", street: "Av. Paulista", number: "1000", district: "Bela Vista", city: "São Paulo", state: "SP" };

describe("Banco: cupons de desconto", () => {
  let db: PGlite;
  let adminId: string;
  let buyerId: string;
  let variant: { id: string; price_cents: number };

  const coupon = async (code: string, fields: Record<string, unknown>) => {
    const cols = ["code", ...Object.keys(fields)];
    const vals = [code, ...Object.values(fields)];
    await db.query(`insert into coupons (${cols.join(", ")}) values (${cols.map((_, i) => `$${i + 1}`).join(", ")})`, vals);
  };
  const quote = (qty: number, code: string | null, cep: string | null = "01310100") =>
    as<{ q: CouponQuote }>(db, { role: "service_role" }, "select public.quote_cart_coupon($1, $2, $3) q", [
      JSON.stringify([{ variant_id: variant.id, quantity: qty }]), cep, code,
    ]).then((r) => r[0].q);
  const order = (qty: number, code: string | null, email = customer.email) =>
    as<{ r: Created }>(db, { role: "service_role" }, "select public.create_order($1, $2, $3, $4, $5, $6, $7, $8) r", [
      randomUUID(), null, JSON.stringify([{ variant_id: variant.id, quantity: qty }]),
      JSON.stringify({ ...customer, email }), JSON.stringify(address), "pix", true, code,
    ]).then((r) => r[0].r);
  const orderRow = (id: string) =>
    db.query<{ subtotal_cents: number; shipping_cents: number; discount_cents: number; total_cents: number; coupon_code: string | null }>(
      "select subtotal_cents, shipping_cents, discount_cents, total_cents, coupon_code from orders where id = $1", [id]).then((r) => r.rows[0]);

  beforeAll(async () => {
    db = await createTestDb();
    await db.exec(seedSql());
    adminId = await createUser(db, "admin@sally.test", "admin");
    buyerId = await createUser(db, "cliente@sally.test");
    const { rows } = await db.query<{ id: string; price_cents: number }>(
      "select v.id, v.price_cents from product_variants v join products p on p.id = v.product_id where p.status = 'published' and v.is_active and v.price_cents between 10000 and 25000 order by v.sku limit 1",
    );
    variant = rows[0];
    await coupon("DEZ", { kind: "percent", percent_off: 10 });
    await coupon("TETO", { kind: "percent", percent_off: 50, max_discount_cents: 2000 });
    await coupon("FIXO30", { kind: "fixed", amount_off_cents: 3000 });
    await coupon("GIGANTE", { kind: "fixed", amount_off_cents: 99_999_00 });
    await coupon("VENCIDO", { kind: "percent", percent_off: 10, ends_at: "2020-01-01T00:00:00Z" });
    await coupon("FUTURO", { kind: "percent", percent_off: 10, starts_at: "2999-01-01T00:00:00Z" });
    await coupon("INATIVO", { kind: "percent", percent_off: 10, is_active: false });
    await coupon("MINIMO", { kind: "percent", percent_off: 10, min_subtotal_cents: 999_999_00 });
    await coupon("UMUSO", { kind: "percent", percent_off: 10, max_uses: 1 });
    await coupon("POREMAIL", { kind: "percent", percent_off: 10, once_per_email: true });
  }, 60_000);

  beforeEach(async () => {
    await db.query("update inventory set on_hand = 100, reserved = 0 where variant_id = $1", [variant.id]);
  });

  describe("cotação", () => {
    it("aplica percentual sobre os produtos e recalcula o frete sobre o valor com desconto", async () => {
      const q = await quote(1, "dez"); // minúsculas e espaços são normalizados
      const expected = Math.floor(variant.price_cents * 0.1);
      expect(q.coupon).toMatchObject({ ok: true, code: "DEZ", discount_cents: expected });
      expect(q.discount_cents).toBe(expected);
      expect(q.subtotal_cents).toBe(variant.price_cents);
    });

    it("respeita o teto do percentual, o valor fixo e nunca zera o pedido", async () => {
      expect((await quote(1, "TETO")).discount_cents).toBe(2000);
      expect((await quote(1, "FIXO30")).discount_cents).toBe(3000);
      expect((await quote(1, "GIGANTE")).discount_cents).toBe(variant.price_cents - 100);
    });

    it("cupom inválido, inexistente, inativo, vencido, futuro e abaixo do mínimo: sem desconto e com o motivo", async () => {
      const cases: [string, string | RegExp][] = [
        ["NAOEXISTE", "CUPOM_INVALIDO"],
        ["x", "CUPOM_INVALIDO"],
        ["'; drop table coupons; --", "CUPOM_INVALIDO"],
        ["INATIVO", "CUPOM_INVALIDO"],
        ["VENCIDO", "CUPOM_EXPIRADO"],
        ["FUTURO", "CUPOM_NAO_INICIADO"],
        ["MINIMO", /^CUPOM_MINIMO:99999900$/],
      ];
      for (const [code, error] of cases) {
        const q = await quote(1, code);
        expect(q.discount_cents, code).toBe(0);
        expect(q.coupon?.ok, code).toBe(false);
        expect(q.coupon?.error, code).toMatch(error);
      }
    });

    it("sem cupom devolve a cotação normal", async () => {
      const q = await quote(1, null);
      expect(q).toMatchObject({ discount_cents: 0, coupon: null });
    });

    it("visitante e cliente não leem cupons nem testam códigos", async () => {
      expect(await as(db, { role: "authenticated", userId: buyerId }, "select code from coupons")).toEqual([]);
      await expect(as(db, { role: "anon" }, "select code from coupons")).rejects.toThrow(/permission denied/);
      for (const actor of [{ role: "anon" } as const, { role: "authenticated", userId: buyerId } as const]) {
        await expect(as(db, actor, "select public.quote_cart_coupon('[]'::jsonb, null, 'DEZ')")).rejects.toThrow(/permission denied/);
        await expect(as(db, actor, "select public.evaluate_coupon('DEZ', 10000)")).rejects.toThrow(/permission denied/);
        await expect(as(db, actor, "select public.admin_list_coupons()")).rejects.toThrow(/permissão negada|permission denied/);
      }
      await expect(
        as(db, { role: "authenticated", userId: buyerId }, "insert into coupons (code, kind, percent_off) values ('HACK', 'percent', 90)"),
      ).rejects.toThrow(/row-level security/);
    });
  });

  describe("pedido", () => {
    it("grava desconto, código e total coerente; o histórico cita o cupom", async () => {
      const r = await order(1, "FIXO30");
      const o = await orderRow(r.order_id);
      expect(o).toMatchObject({ subtotal_cents: variant.price_cents, discount_cents: 3000, coupon_code: "FIXO30" });
      expect(o.total_cents).toBe(o.subtotal_cents + o.shipping_cents - 3000);
      expect(r.total_cents).toBe(o.total_cents);
      const ev = await db.query<{ note: string }>("select note from order_events where order_id = $1", [r.order_id]);
      expect(ev.rows[0].note).toMatch(/cupom FIXO30/);
      const [{ p }] = await as<{ p: { coupon_code: string; discount_cents: number } }>(db, { role: "anon" }, "select public.get_order_public($1) p", [r.token]);
      expect(p).toMatchObject({ coupon_code: "FIXO30", discount_cents: 3000 });
    });

    it("recusa o pedido (sem reservar estoque) com cupom vencido, inválido ou abaixo do mínimo", async () => {
      await expect(order(1, "VENCIDO")).rejects.toThrow(/CUPOM_EXPIRADO/);
      await expect(order(1, "NAOEXISTE")).rejects.toThrow(/CUPOM_INVALIDO/);
      await expect(order(1, "MINIMO")).rejects.toThrow(/CUPOM_MINIMO/);
      const { rows } = await db.query<{ reserved: number }>("select reserved from inventory where variant_id = $1", [variant.id]);
      expect(rows[0].reserved).toBe(0);
    });

    it("limite de usos: esgota e volta a valer quando o pedido expira ou é cancelado", async () => {
      const first = await order(1, "UMUSO");
      await expect(order(1, "UMUSO", "outra@example.com")).rejects.toThrow(/CUPOM_ESGOTADO/);
      expect((await quote(1, "UMUSO")).coupon?.error).toBe("CUPOM_ESGOTADO");
      await as(db, { role: "authenticated", userId: adminId }, "select public.admin_update_order_status($1, 'canceled')", [first.order_id]);
      expect((await quote(1, "UMUSO")).coupon?.ok).toBe(true);
      const again = await order(1, "UMUSO", "outra@example.com");
      await db.query("update orders set reserved_until = now() - interval '1 minute' where id = $1", [again.order_id]);
      expect((await order(1, "UMUSO", "terceira@example.com")).total_cents).toBeGreaterThan(0);
    });

    it("cupom de uso único por e-mail", async () => {
      await order(1, "POREMAIL", "unica@example.com");
      await expect(order(1, "POREMAIL", "UNICA@example.com")).rejects.toThrow(/CUPOM_JA_USADO/);
      await expect(order(1, "POREMAIL", "nova@example.com")).resolves.toBeTruthy();
    });

    it("o painel lista os cupons com usos; o cupom não pode ser apagado, só desativado", async () => {
      const [{ r }] = await as<{ r: { code: string; uses: number }[] }>(db, { role: "authenticated", userId: adminId }, "select public.admin_list_coupons() r");
      expect(r.find((c) => c.code === "FIXO30")?.uses).toBe(1);
      expect(r.some((c) => c.code === "BEMVINDA10")).toBe(true); // cupom de demonstração da migration
      await expect(as(db, { role: "authenticated", userId: adminId }, "delete from coupons where code = 'DEZ'")).rejects.toThrow(/permission denied/);
      await as(db, { role: "authenticated", userId: adminId }, "update coupons set is_active = false where code = 'DEZ'");
      expect((await quote(1, "DEZ")).coupon?.error).toBe("CUPOM_INVALIDO");
      const audit = await db.query<{ n: number }>("select count(*)::int n from audit_logs where entity = 'coupons' and action = 'update'");
      expect(audit.rows[0].n).toBeGreaterThan(0);
    });

    it("recusa cupom com regras incoerentes", async () => {
      await expect(coupon("RUIM1", { kind: "percent", percent_off: 95 })).rejects.toThrow(/check/);
      await expect(coupon("RUIM2", { kind: "fixed", amount_off_cents: 100, percent_off: 10 })).rejects.toThrow(/check/);
      await expect(coupon("ruim3", { kind: "percent", percent_off: 10 })).rejects.toThrow(/check/);
      await expect(coupon("RUIM4", { kind: "percent", percent_off: 10, starts_at: "2030-01-02", ends_at: "2030-01-01" })).rejects.toThrow(/check/);
    });
  });
});
