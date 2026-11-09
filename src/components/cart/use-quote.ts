"use client";
import { useEffect, useState } from "react";
import { quoteCart } from "@/app/(loja)/carrinho/actions";
import type { CartItem } from "@/lib/cart/store";
import type { Quote } from "@/lib/checkout/schemas";

/**
 * Mantém a cotação do servidor em dia com a sacola (e o CEP e o cupom, quando houver).
 * Debounce curto para não disparar uma chamada por clique no seletor de quantidade.
 */
export function useQuote(items: CartItem[], cep?: string, coupon?: string) {
  const [state, setState] = useState<{ quote: Quote | null; error?: string; key: string | null }>({ quote: null, key: null });
  const key = JSON.stringify([items, cep ?? "", coupon ?? ""]);

  useEffect(() => {
    if (!items.length) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await quoteCart(items, cep ?? null, coupon ?? null);
        if (!cancelled) setState({ quote: r.quote, error: r.error, key });
      } catch {
        if (!cancelled) setState((s) => ({ ...s, error: "Não foi possível atualizar a sacola agora.", key }));
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
    // key resume items + cep + cupom
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!items.length) return { quote: null, loading: false, error: undefined };
  return { quote: state.quote, loading: state.key !== key, error: state.error };
}
