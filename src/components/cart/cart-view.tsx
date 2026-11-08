"use client";
import { ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/catalog/product-image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cart, useCart, useHydrated } from "@/lib/cart/store";
import { resolveImageUrl } from "@/lib/catalog/images";
import { formatBRL } from "@/lib/money";
import { OrderSummary } from "./order-summary";
import { useQuote } from "./use-quote";

export const CEP_KEY = "sally-cep";

export function CartView() {
  const hydrated = useHydrated();
  const items = useCart();
  const [cep, setCep] = useState(() => (typeof window === "undefined" ? "" : (sessionStorage.getItem(CEP_KEY) ?? "")));
  const cepDigits = cep.replace(/\D/g, "");
  const { quote, loading, error } = useQuote(items, cepDigits.length === 8 ? cepDigits : undefined);

  if (!hydrated) return <CartSkeleton />;
  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <ShoppingBag className="size-10 text-muted" aria-hidden />
        <p className="text-lg">Sua sacola está vazia.</p>
        <Button asChild>
          <Link href="/produtos">Ver perfumes</Link>
        </Button>
      </div>
    );
  }

  const problems = quote?.lines.filter((l) => !l.available || l.quantity < l.requested) ?? [];
  const canCheckout = Boolean(quote) && !loading && problems.length === 0 && (quote?.subtotal_cents ?? 0) > 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <section aria-labelledby="itens">
        <h2 id="itens" className="sr-only">
          Itens da sacola
        </h2>
        {error && (
          <p role="alert" className="mb-4 rounded-card bg-error/10 px-4 py-2 text-sm text-error">
            {error}
          </p>
        )}
        {!quote ? (
          <CartSkeleton />
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {quote.lines.map((l) => {
              const label = l.name ? `${l.name}${l.volume_ml ? ` ${l.volume_ml} ml` : ""}` : "Produto indisponível";
              const over = l.available && l.quantity < l.requested;
              return (
                <li key={l.variant_id} className="flex gap-4 py-4">
                  <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-border sm:w-24">
                    <ProductImage src={resolveImageUrl({ storage_path: l.image_path, external_url: l.image_url })} alt={label} sizes="96px" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        {l.brand_name && <p className="text-xs uppercase tracking-wide text-muted">{l.brand_name}</p>}
                        {l.slug ? (
                          <Link href={`/produtos/${l.slug}`} className="font-medium hover:text-primary">
                            {label}
                          </Link>
                        ) : (
                          <p className="font-medium">{label}</p>
                        )}
                        {l.price_cents != null && <p className="text-sm text-muted">{formatBRL(l.price_cents)} cada</p>}
                      </div>
                      <p className="shrink-0 font-semibold tabular-nums">{formatBRL(l.line_total_cents)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {l.available ? (
                        <label className="text-sm">
                          <span className="sr-only">Quantidade de {label}</span>
                          <select
                            value={Math.min(l.requested, Math.max(l.max_qty, 1))}
                            onChange={(e) => cart.setQuantity(l.variant_id, Number(e.target.value))}
                            className="h-9 rounded-full border border-border bg-background px-3"
                          >
                            {Array.from({ length: Math.max(l.max_qty, 1) }, (_, i) => i + 1).map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                      <button type="button" onClick={() => cart.remove(l.variant_id)} className="inline-flex items-center gap-1 text-sm text-muted hover:text-error">
                        <Trash2 className="size-4" aria-hidden /> Remover<span className="sr-only"> {label}</span>
                      </button>
                    </div>
                    {!l.available && <p className="text-sm text-error">Indisponível no momento. Remova para continuar.</p>}
                    {over && (
                      <p className="text-sm text-warning">
                        Só {l.max_qty} disponível(is).{" "}
                        <button type="button" className="font-medium underline" onClick={() => cart.setQuantity(l.variant_id, l.max_qty)}>
                          Ajustar quantidade
                        </button>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted">Preços e disponibilidade são conferidos de novo ao finalizar. O estoque só é reservado quando o pedido é criado.</p>
      </section>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="cep-sacola" className="text-sm font-medium">
            Calcular frete
          </label>
          <Input
            id="cep-sacola"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="00000-000"
            maxLength={9}
            value={cep}
            onChange={(e) => {
              setCep(e.target.value);
              sessionStorage.setItem(CEP_KEY, e.target.value);
            }}
          />
          {cepDigits.length === 8 && quote && !quote.shipping && !loading && <p className="text-xs text-error">CEP inválido.</p>}
        </div>
        <OrderSummary quote={quote} loading={loading}>
          {canCheckout ? (
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout">Finalizar compra</Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full" disabled>
              {loading ? "Atualizando…" : "Finalizar compra"}
            </Button>
          )}
          {problems.length > 0 && <p className="text-xs text-error">Resolva os itens destacados para continuar.</p>}
        </OrderSummary>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Carregando a sacola">
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-24" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
