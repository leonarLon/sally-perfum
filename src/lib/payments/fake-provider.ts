import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { CARD_TOKEN_RE } from "./fake-card";
import type { Charge, ChargeRequest, PaymentProvider, WebhookEvent, WebhookEventType } from "./types";

/**
 * Provedor SIMULADO (PAYMENT_PROVIDER=fake). Gera códigos Pix e linhas de boleto de
 * demonstração, que não pagam nada, e eventos no mesmo formato de um webhook real.
 */
export const fakeProvider: PaymentProvider = {
  name: "fake",
  async createCharge(req: ChargeRequest): Promise<Charge> {
    const providerRef = `fake_${req.method}_${randomBytes(12).toString("hex")}`;
    if (req.method === "pix") {
      const amount = (req.amountCents / 100).toFixed(2);
      return {
        providerRef,
        // Formato parecido com o "copia e cola" (EMV), marcado como demonstração.
        pixCode: `00020126580014BR.GOV.BCB.PIX0136DEMO-SALLY-${providerRef.slice(-12).toUpperCase()}5204000053039865406${amount.padStart(6, "0")}5802BR5915SALLY DEMO6009SAO PAULO62070503***6304DEMO`,
        expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      };
    }
    if (req.method === "boleto") {
      const n = String(req.orderNumber).padStart(10, "0");
      const cents = String(req.amountCents).padStart(10, "0");
      return { providerRef, boletoLine: `00190.00009 0${n.slice(0, 4)}.${n.slice(4)}0 00000.000000 1 0000${cents}`, expiresAt: new Date(Date.now() + 30 * 60_000).toISOString() };
    }
    const m = CARD_TOKEN_RE.exec(req.cardToken ?? "");
    if (!m) throw new Error("INVALID_CARD_TOKEN");
    return {
      providerRef,
      cardBrand: m[2],
      cardLast4: m[3],
      outcome: m[1] === "approve" ? "approved" : "declined",
      declineReason: m[1] === "approve" ? undefined : "Recusado pelo emissor (cartão de teste)",
    };
  },
};

/** Monta um evento como o provedor enviaria ao webhook. */
export function buildFakeEvent(type: WebhookEventType, providerRef: string, amountCents: number, reason?: string): WebhookEvent {
  return {
    id: `evt_${randomUUID().replace(/-/g, "")}`,
    type,
    created: Math.floor(Date.now() / 1000),
    data: { provider_ref: providerRef, amount_cents: amountCents, ...(reason ? { reason } : {}) },
  };
}
