/** Contrato independente de gateway. Trocar de provedor = nova implementação desta interface. */
export type PaymentMethod = "pix" | "card" | "boleto";

export type ChargeRequest = {
  orderId: string;
  orderNumber: number;
  amountCents: number;
  method: PaymentMethod;
  /** Cartão: token gerado no navegador pelo SDK do provedor. O número do cartão nunca chega ao servidor. */
  cardToken?: string;
};

export type Charge = {
  providerRef: string;
  pixCode?: string;
  boletoLine?: string;
  cardBrand?: string;
  cardLast4?: string;
  expiresAt?: string;
  /** Cartão: resultado imediato da autorização, entregue ao sistema pelo webhook. */
  outcome?: "approved" | "declined";
  declineReason?: string;
};

export type WebhookEventType = "payment.approved" | "payment.declined" | "payment.expired" | "payment.refunded";

export type WebhookEvent = {
  id: string;
  type: WebhookEventType;
  created: number;
  data: { provider_ref: string; amount_cents: number; reason?: string };
};

export interface PaymentProvider {
  readonly name: "fake";
  createCharge(req: ChargeRequest): Promise<Charge>;
}
