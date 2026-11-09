// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fakeTokenize, luhnValid } from "./fake-card";
import { signPayload, verifySignature } from "./signature";

const SECRET = "s".repeat(64);
const rpc = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({ createSupabaseAdminClient: () => ({ rpc }) }));

describe("webhook: assinatura HMAC", () => {
  const body = JSON.stringify({ id: "evt_123", type: "payment.approved" });

  it("aceita a assinatura correta dentro da tolerância", () => {
    const now = 1_700_000_000;
    expect(verifySignature(body, signPayload(body, SECRET, now), SECRET, now + 10)).toEqual({ ok: true });
  });

  it("recusa corpo alterado, segredo errado, assinatura ausente, malformada ou antiga (replay)", () => {
    const now = 1_700_000_000;
    const header = signPayload(body, SECRET, now);
    expect(verifySignature(body.replace("approved", "refunded"), header, SECRET, now)).toEqual({ ok: false, reason: "mismatch" });
    expect(verifySignature(body, header, "x".repeat(64), now)).toEqual({ ok: false, reason: "mismatch" });
    expect(verifySignature(body, null, SECRET, now)).toEqual({ ok: false, reason: "missing" });
    expect(verifySignature(body, "t=abc,v1=zz", SECRET, now)).toEqual({ ok: false, reason: "malformed" });
    expect(verifySignature(body, header, SECRET, now + 301)).toEqual({ ok: false, reason: "expired" });
  });
});

describe("cartão de teste: tokenização no navegador", () => {
  const now = new Date("2026-11-08T12:00:00Z");

  it("gera token só com resultado, bandeira e 4 últimos dígitos", () => {
    expect(fakeTokenize("4242 4242 4242 4242", "12/30", "123", now)).toEqual({ token: "tok_fake_approve_visa_4242" });
    expect(fakeTokenize("4000000000000002", "01/29", "999", now)).toEqual({ token: "tok_fake_decline_visa_0002" });
    expect(fakeTokenize("5555555555554444", "01/29", "999", now)).toEqual({ token: "tok_fake_approve_mastercard_4444" });
  });

  it("valida Luhn, cartão de teste, validade e CVV", () => {
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(fakeTokenize("4242424242424241", "12/30", "123", now)).toMatchObject({ field: "number" });
    expect(fakeTokenize("4111111111111111", "12/30", "123", now)).toMatchObject({ field: "number" }); // Luhn ok, mas não é de teste
    expect(fakeTokenize("4242424242424242", "10/26", "123", now)).toMatchObject({ field: "expiry" }); // vencido
    expect(fakeTokenize("4242424242424242", "13/30", "123", now)).toMatchObject({ field: "expiry" });
    expect(fakeTokenize("4242424242424242", "12/30", "12", now)).toMatchObject({ field: "cvc" });
  });
});

describe("webhook: processamento", () => {
  beforeEach(() => {
    rpc.mockReset();
    process.env.PAYMENT_WEBHOOK_SECRET = SECRET;
    process.env.PAYMENT_PROVIDER = "fake";
  });
  const event = (over: Record<string, unknown> = {}) =>
    JSON.stringify({ id: "evt_abcdef123456", type: "payment.approved", created: 1, data: { provider_ref: `fake_pix_${"a".repeat(24)}`, amount_cents: 18990 }, ...over });

  it("aplica evento assinado no banco e devolve o resultado", async () => {
    const { handlePaymentWebhook } = await import("./webhook");
    rpc.mockResolvedValue({ data: { duplicate: false, result: "order_paid" }, error: null });
    const body = event();
    const r = await handlePaymentWebhook(body, signPayload(body, SECRET));
    expect(r).toEqual({ status: 200, body: { ok: true, duplicate: false, result: "order_paid" } });
    expect(rpc).toHaveBeenCalledWith("apply_payment_event", expect.objectContaining({ p_event_id: "evt_abcdef123456", p_amount_cents: 18990, p_provider: "fake" }));
  });

  it("recusa sem assinatura válida sem tocar no banco", async () => {
    const { handlePaymentWebhook } = await import("./webhook");
    const r = await handlePaymentWebhook(event(), "t=1,v1=" + "0".repeat(64));
    expect(r.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("recusa evento assinado mas com formato inválido", async () => {
    const { handlePaymentWebhook } = await import("./webhook");
    for (const body of [event({ type: "payment.hacked" }), event({ data: { provider_ref: "x", amount_cents: -1 } }), "{"]) {
      expect((await handlePaymentWebhook(body, signPayload(body, SECRET))).status).toBe(400);
    }
    expect(rpc).not.toHaveBeenCalled();
  });

  it("falha no banco devolve 500 para o provedor tentar de novo", async () => {
    const { handlePaymentWebhook } = await import("./webhook");
    rpc.mockResolvedValue({ data: null, error: { message: "timeout" } });
    const body = event();
    expect((await handlePaymentWebhook(body, signPayload(body, SECRET))).status).toBe(500);
  });
});
