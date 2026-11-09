import { formatBRL } from "@/lib/money";
import type { Quote } from "@/lib/checkout/schemas";
import { installmentText } from "@/components/catalog/price";

/** Resumo de valores (sacola e checkout). Tudo vem da cotação do servidor. */
export function OrderSummary({ quote, loading, children }: { quote: Quote | null; loading?: boolean; children?: React.ReactNode }) {
  const subtotal = quote?.subtotal_cents ?? 0;
  const ship = quote?.shipping ?? null;
  const discount = quote?.discount_cents ?? 0;
  const goods = subtotal - discount; // frete grátis é avaliado sobre os produtos já com desconto
  const total = goods + (ship?.price_cents ?? 0);
  const freeOver = quote?.free_shipping_over_cents ?? null;
  const missing = freeOver && !ship?.free && goods > 0 && goods < freeOver ? freeOver - goods : 0;
  const installments = installmentText(total);

  return (
    <section aria-labelledby="resumo" className="space-y-4 rounded-card border border-border bg-surface p-5" aria-busy={loading}>
      <h2 id="resumo" className="font-display text-xl font-semibold">
        Resumo
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatBRL(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <dt>Desconto{quote?.coupon?.code ? ` (cupom ${quote.coupon.code})` : ""}</dt>
            <dd className="tabular-nums text-success">−{formatBRL(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt>Frete{ship && <span className="block text-xs text-muted">{ship.label} · {ship.days_min} a {ship.days_max} dias úteis</span>}</dt>
          <dd className="tabular-nums">{ship ? (ship.free ? <span className="text-success">Grátis</span> : formatBRL(ship.price_cents)) : <span className="text-muted">informe o CEP</span>}</dd>
        </div>
        <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatBRL(total)}</dd>
        </div>
      </dl>
      {installments && ship && <p className="-mt-2 text-right text-xs text-muted">{installments}</p>}
      {missing > 0 && (
        <p className="text-xs text-muted">
          Faltam <strong>{formatBRL(missing)}</strong> para frete grátis.
        </p>
      )}
      {children}
    </section>
  );
}
