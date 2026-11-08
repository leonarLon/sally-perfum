import "server-only";
import { z } from "zod";
import { getPaymentEnv } from "@/lib/env.server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { signPayload, verifySignature } from "./signature";
import type { WebhookEvent } from "./types";

const eventSchema = z.object({
  id: z.string().regex(/^evt_[A-Za-z0-9]{8,64}$/),
  type: z.enum(["payment.approved", "payment.declined", "payment.expired", "payment.refunded"]),
  created: z.number().int(),
  data: z.object({
    provider_ref: z.string().regex(/^fake_[a-z]+_[0-9a-f]{24}$/),
    amount_cents: z.number().int().positive(),
    reason: z.string().max(200).optional(),
  }),
});

export type WebhookOutcome =
  | { status: 200; body: { ok: true; duplicate: boolean; result?: string } }
  | { status: 400 | 401 | 500; body: { ok: false; error: string } };

/**
 * Processa um webhook do provedor: (1) confere a assinatura sobre o corpo BRUTO,
 * (2) valida o formato, (3) aplica no banco de forma idempotente (apply_payment_event).
 * Usado pela rota /api/webhooks/payments e pela simulação do provedor fake.
 */
export async function handlePaymentWebhook(rawBody: string, signatureHeader: string | null): Promise<WebhookOutcome> {
  const { PAYMENT_WEBHOOK_SECRET, PAYMENT_PROVIDER } = getPaymentEnv();
  const sig = verifySignature(rawBody, signatureHeader, PAYMENT_WEBHOOK_SECRET);
  if (!sig.ok) return { status: 401, body: { ok: false, error: `assinatura inválida (${sig.reason})` } };

  let json: unknown;
  try {
    json = JSON.parse(rawBody);
  } catch {
    return { status: 400, body: { ok: false, error: "JSON inválido" } };
  }
  const parsed = eventSchema.safeParse(json);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "evento inválido" } };
  const e = parsed.data;

  const { data, error } = await createSupabaseAdminClient().rpc("apply_payment_event", {
    p_provider: PAYMENT_PROVIDER,
    p_event_id: e.id,
    p_type: e.type,
    p_provider_ref: e.data.provider_ref,
    p_amount_cents: e.data.amount_cents,
    p_payload: e,
  });
  // 500 faz o provedor tentar de novo; a idempotência garante que não duplique.
  if (error) return { status: 500, body: { ok: false, error: "falha ao aplicar o evento" } };
  const r = data as { duplicate: boolean; result?: string };
  return { status: 200, body: { ok: true, duplicate: r.duplicate, result: r.result } };
}

/** Simulação do provedor fake: assina o evento como o provedor faria e entrega ao mesmo processador. */
export async function deliverFakeEvent(event: WebhookEvent) {
  const body = JSON.stringify(event);
  return handlePaymentWebhook(body, signPayload(body, getPaymentEnv().PAYMENT_WEBHOOK_SECRET));
}
