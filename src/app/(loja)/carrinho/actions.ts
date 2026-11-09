"use server";
import { headers } from "next/headers";
import { cartItemsSchema, couponCodeSchema, type Quote } from "@/lib/checkout/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createPublicClient } from "@/lib/supabase/public";

export type QuoteResult = { quote: Quote | null; error?: string };

/**
 * Cotação da sacola: preço atual, disponibilidade e frete calculados no banco.
 * O navegador manda só variante + quantidade (e o código do cupom, se houver).
 */
export async function quoteCart(items: unknown, cep?: string | null, coupon?: string | null): Promise<QuoteResult> {
  if (Array.isArray(items) && items.length === 0) return { quote: null };
  const parsed = cartItemsSchema.safeParse(items);
  if (!parsed.success) return { quote: null, error: "Sacola inválida." };
  const ip = clientIp(await headers());
  const limit = rateLimit(`quote:${ip}`, 120, 60_000);
  if (!limit.ok) return { quote: null, error: "Muitas atualizações seguidas. Aguarde um instante." };

  const cleanCep = typeof cep === "string" ? cep.replace(/\D/g, "").slice(0, 8) : "";
  const p_items = parsed.data.map((i) => ({ variant_id: i.variantId, quantity: i.quantity }));
  const p_cep = cleanCep.length === 8 ? cleanCep : null;
  const code = couponCodeSchema.safeParse(coupon ?? "");

  if (!code.success) {
    // Formato impossível: nem consulta o banco.
    const { data, error } = await createPublicClient().rpc("quote_cart", { p_items, p_cep });
    if (error) return { quote: null, error: "Não foi possível atualizar a sacola agora." };
    return { quote: { ...(data as Quote), discount_cents: 0, coupon: { ok: false, error: "CUPOM_INVALIDO" } } };
  }
  if (code.data === "") {
    const { data, error } = await createPublicClient().rpc("quote_cart", { p_items, p_cep });
    if (error) return { quote: null, error: "Não foi possível atualizar a sacola agora." };
    return { quote: data as Quote };
  }

  // Validar cupom fica restrito ao servidor (service role) e limitado: evita testar códigos em massa.
  const tries = rateLimit(`coupon:${ip}`, 30, 10 * 60_000);
  if (!tries.ok) return { quote: null, error: "Muitas tentativas de cupom. Aguarde alguns minutos." };
  const { data, error } = await createSupabaseAdminClient().rpc("quote_cart_coupon", { p_items, p_cep, p_coupon: code.data });
  if (error) return { quote: null, error: "Não foi possível atualizar a sacola agora." };
  return { quote: data as Quote };
}
