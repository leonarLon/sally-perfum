"use server";
import { headers } from "next/headers";
import { cartItemsSchema, type Quote } from "@/lib/checkout/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createPublicClient } from "@/lib/supabase/public";

export type QuoteResult = { quote: Quote | null; error?: string };

/**
 * Cotação da sacola: preço atual, disponibilidade e frete calculados no banco.
 * O navegador manda só variante + quantidade.
 */
export async function quoteCart(items: unknown, cep?: string | null): Promise<QuoteResult> {
  if (Array.isArray(items) && items.length === 0) return { quote: null };
  const parsed = cartItemsSchema.safeParse(items);
  if (!parsed.success) return { quote: null, error: "Sacola inválida." };
  const limit = rateLimit(`quote:${clientIp(await headers())}`, 120, 60_000);
  if (!limit.ok) return { quote: null, error: "Muitas atualizações seguidas. Aguarde um instante." };

  const cleanCep = typeof cep === "string" ? cep.replace(/\D/g, "").slice(0, 8) : "";
  const { data, error } = await createPublicClient().rpc("quote_cart", {
    p_items: parsed.data.map((i) => ({ variant_id: i.variantId, quantity: i.quantity })),
    p_cep: cleanCep.length === 8 ? cleanCep : null,
  });
  if (error) return { quote: null, error: "Não foi possível atualizar a sacola agora." };
  return { quote: data as Quote };
}
