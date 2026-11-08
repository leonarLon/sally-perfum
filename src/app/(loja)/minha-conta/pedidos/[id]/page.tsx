import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { getMyOrder } from "@/lib/account/queries";
import { ORDER_STATUS } from "@/lib/checkout/status";
import { formatBRL } from "@/lib/money";

export const metadata = { title: "Pedido" };

export default async function MyOrderPage({ params }: PageProps<"/minha-conta/pedidos/[id]">) {
  const { id } = await params;
  const data = await getMyOrder(id);
  if (!data) notFound(); // inexistente ou de outra pessoa (a RLS não devolve)
  const { order: o, items, events } = data;
  const st = ORDER_STATUS[o.status];
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link href="/minha-conta/pedidos" className="text-sm text-primary hover:underline">
          ← Meus pedidos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">Pedido #{o.number}</h1>
          <Badge variant={st.variant}>{st.label}</Badge>
        </div>
        <p className="text-sm text-muted">Feito em {formatDateTime(o.created_at)}</p>
      </div>

      <section aria-labelledby="itens" className="space-y-3">
        <h2 id="itens" className="font-display text-xl font-semibold">
          Itens
        </h2>
        <ul className="divide-y divide-border border-y border-border text-sm">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between gap-4 py-3">
              <span>
                {it.quantity}×{" "}
                <Link href={`/produtos/${it.product_slug}`} className="hover:text-primary">
                  {it.product_name}
                </Link>
                {it.volume_ml ? ` ${it.volume_ml} ml` : ""} <span className="text-muted">· {it.brand_name}</span>
              </span>
              <span className="tabular-nums">{formatBRL(it.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <dl className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Frete</dt>
            <dd className="tabular-nums">{Number(o.shipping_cents) === 0 ? "Grátis" : formatBRL(Number(o.shipping_cents))}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBRL(o.total_cents)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 text-sm sm:grid-cols-2">
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold">Entrega</h2>
          <p>{o.customer_name}</p>
          <p className="text-muted">
            {o.ship_street}, {o.ship_number}
            {o.ship_complement ? ` · ${o.ship_complement}` : ""} · {o.ship_district}
          </p>
          <p className="text-muted">
            {o.ship_city}/{o.ship_state} · {o.shipping_label}
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold">Histórico</h2>
          <ol className="space-y-1">
            {events.map((e) => (
              <li key={e.id} className="flex justify-between gap-3">
                <span>{ORDER_STATUS[e.to_status]?.label ?? e.to_status}</span>
                <time dateTime={e.created_at} className="text-muted">
                  {formatDateTime(e.created_at)}
                </time>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
