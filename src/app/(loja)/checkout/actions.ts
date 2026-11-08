"use server";
import { headers } from "next/headers";
import { fieldErrors, formToObject } from "@/lib/admin/schemas";
import { getSessionUser } from "@/lib/auth/session";
import { CHECKOUT_FIELDS, checkoutSchema, orderErrorMessage } from "@/lib/checkout/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type CheckoutState = {
  ok?: boolean;
  token?: string;
  message?: string;
  fieldErrors?: Record<string, string>;
  outOfStock?: string;
};

/**
 * Cria o pedido. Fluxo: validação zod → limite de tentativas → sessão (opcional, para
 * vincular o pedido à conta) → create_order no banco com service role, que recalcula
 * preços e frete, reserva o estoque e é idempotente pela chave gerada no navegador.
 */
export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const parsed = checkoutSchema.safeParse(formToObject(formData, CHECKOUT_FIELDS));
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error);
    return { fieldErrors: errors, message: errors.items ?? "Revise os campos destacados." };
  }
  const d = parsed.data;

  const ip = clientIp(await headers());
  const byIp = rateLimit(`order:ip:${ip}`, 10, 10 * 60_000);
  const byEmail = rateLimit(`order:email:${d.email.toLowerCase()}`, 5, 10 * 60_000);
  if (!byIp.ok || !byEmail.ok) return { message: "Muitas tentativas de pedido. Aguarde alguns minutos e tente de novo." };

  const user = await getSessionUser();
  const { data, error } = await createSupabaseAdminClient().rpc("create_order", {
    p_idempotency_key: d.idempotency_key,
    p_user_id: user?.id ?? null,
    p_items: d.items.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
    p_customer: { name: d.name, email: d.email, phone: d.phone },
    p_address: { cep: d.cep, street: d.street, number: d.number, complement: d.complement, district: d.district, city: d.city, state: d.state },
    p_payment_method: d.payment_method,
    p_privacy_accepted: true,
  });
  if (error) return orderErrorMessage(error.message);

  const result = data as { token: string };
  return { ok: true, token: result.token };
}
