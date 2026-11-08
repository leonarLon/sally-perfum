"use server";
import { headers } from "next/headers";
import { refresh } from "next/cache";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { CARD_TOKEN_RE } from "@/lib/payments/fake-card";
import { buildFakeEvent, fakeProvider } from "@/lib/payments/fake-provider";
import type { PaymentMethod } from "@/lib/payments/types";
import { deliverFakeEvent } from "@/lib/payments/webhook";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PaymentState = { ok?: boolean; message?: string };

const TOKEN_RE = /^[0-9a-f]{64}$/;
const BUSY: PaymentState = { message: "Muitas tentativas. Aguarde um instante e tente de novo." };

/** O token do link é a credencial do cliente sem cadastro (mesma regra de get_order_public). */
async function orderByToken(token: string) {
  if (!TOKEN_RE.test(token)) return null;
  const { data } = await createSupabaseAdminClient()
    .from("orders")
    .select("id, number, total_cents, status, reserved_until")
    .eq("public_token", token)
    .maybeSingle();
  return data as { id: string; number: number; total_cents: number; status: string; reserved_until: string | null } | null;
}

async function limited(token: string) {
  const ip = clientIp(await headers());
  return !rateLimit(`pay:ip:${ip}`, 30, 10 * 60_000).ok || !rateLimit(`pay:order:${token}`, 15, 10 * 60_000).ok;
}

function notPayable(o: { status: string; reserved_until: string | null } | null): PaymentState | null {
  if (!o) return { message: "Pedido não encontrado." };
  if (o.status !== "pending_payment") return { message: "Este pedido não está mais aguardando pagamento." };
  if (o.reserved_until && new Date(o.reserved_until).getTime() < Date.now()) return { message: "A reserva expirou. Faça um novo pedido." };
  return null;
}

async function registerCharge(orderId: string, method: PaymentMethod, charge: Awaited<ReturnType<typeof fakeProvider.createCharge>>, amount: number) {
  return createSupabaseAdminClient().rpc("create_payment", {
    p_order_id: orderId,
    p_provider: fakeProvider.name,
    p_provider_ref: charge.providerRef,
    p_method: method,
    p_amount_cents: amount,
    p_pix_code: charge.pixCode ?? null,
    p_boleto_line: charge.boletoLine ?? null,
    p_card_brand: charge.cardBrand ?? null,
    p_card_last4: charge.cardLast4 ?? null,
    p_expires_at: charge.expiresAt ?? null,
  });
}

/** Gera a cobrança Pix ou boleto (código para pagar). */
export async function startPayment(token: string, method: "pix" | "boleto"): Promise<PaymentState> {
  if (method !== "pix" && method !== "boleto") return { message: "Forma de pagamento inválida." };
  if (await limited(token)) return BUSY;
  const o = await orderByToken(token);
  const blocked = notPayable(o);
  if (blocked || !o) return blocked!;

  const charge = await fakeProvider.createCharge({ orderId: o.id, orderNumber: o.number, amountCents: o.total_cents, method });
  const { error } = await registerCharge(o.id, method, charge, o.total_cents);
  if (error) return { message: "Não foi possível gerar a cobrança. Tente de novo." };
  refresh();
  return { ok: true };
}

/** Cartão: recebe só o token do "SDK" (nunca o número), autoriza e entrega o resultado via webhook. */
export async function payWithCard(token: string, cardToken: string): Promise<PaymentState> {
  if (!CARD_TOKEN_RE.test(cardToken)) return { message: "Dados do cartão inválidos." };
  if (await limited(token)) return BUSY;
  const o = await orderByToken(token);
  const blocked = notPayable(o);
  if (blocked || !o) return blocked!;

  const charge = await fakeProvider.createCharge({ orderId: o.id, orderNumber: o.number, amountCents: o.total_cents, method: "card", cardToken });
  const { error } = await registerCharge(o.id, "card", charge, o.total_cents);
  if (error) return { message: "Não foi possível processar o pagamento. Tente de novo." };

  const event = buildFakeEvent(charge.outcome === "approved" ? "payment.approved" : "payment.declined", charge.providerRef, o.total_cents, charge.declineReason);
  const delivered = await deliverFakeEvent(event);
  refresh();
  if (delivered.status !== 200) return { message: "O pagamento foi enviado, mas a confirmação falhou. Atualize a página em instantes." };
  return charge.outcome === "approved" ? { ok: true, message: "Pagamento aprovado!" } : { message: "Pagamento recusado pelo emissor. Tente outro cartão ou outra forma de pagamento." };
}

/**
 * DEMONSTRAÇÃO: faz o papel do banco/provedor avisando que o Pix ou boleto foi pago.
 * O evento passa pela mesma verificação de assinatura do webhook real.
 */
export async function simulateProviderPayment(token: string): Promise<PaymentState> {
  if (await limited(token)) return BUSY;
  const o = await orderByToken(token);
  const blocked = notPayable(o);
  if (blocked || !o) return blocked!;
  const { data: p } = await createSupabaseAdminClient()
    .from("payments")
    .select("provider_ref, amount_cents")
    .eq("order_id", o.id)
    .eq("status", "pending")
    .maybeSingle();
  if (!p) return { message: "Gere o código de pagamento primeiro." };
  const delivered = await deliverFakeEvent(buildFakeEvent("payment.approved", p.provider_ref as string, p.amount_cents as number));
  refresh();
  return delivered.status === 200 ? { ok: true, message: "Pagamento confirmado!" } : { message: "A confirmação falhou. Tente de novo." };
}
