import Link from "next/link";
import { notFound } from "next/navigation";
import { ActionButton } from "@/components/admin/form-kit";
import { formatDateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getOrder } from "@/lib/admin/queries";
import { PAYMENT_METHODS } from "@/lib/checkout/schemas";
import { NEXT_STATUS, ORDER_STATUS, PAYMENT_STATUS, type OrderStatus } from "@/lib/checkout/status";
import { formatBRL } from "@/lib/money";
import { updateOrderStatus } from "../actions";

export const metadata = { title: "Pedido" };

export default async function OrderDetailPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const { user } = await requireRole();
  const data = await getOrder(id);
  if (!data) notFound();
  const { order: o, items, events, payments } = data;
  const st = ORDER_STATUS[o.status];
  const next = NEXT_STATUS[o.status as OrderStatus];
  const who = (actor: string | null) => (actor === null ? "Sistema / cliente" : actor === user.id ? "Você" : `Usuário ${actor.slice(0, 8)}`);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="space-y-2">
        <Link href="/admin/pedidos" className="text-sm text-primary hover:underline">
          ← Pedidos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">Pedido #{o.number}</h1>
          <Badge variant={st.variant}>{st.label}</Badge>
          {o.is_demo && <Badge variant="outline">Demonstração</Badge>}
        </div>
        <p className="text-sm text-muted">
          Criado em {formatDateTime(o.created_at)} · {PAYMENT_METHODS[o.payment_method]}
          {o.status === "pending_payment" && o.reserved_until && ` · reserva até ${formatDateTime(o.reserved_until)}`}
          {o.user_id ? " · cliente com conta" : " · compra sem cadastro"}
        </p>
      </div>

      {next.length > 0 && (
        <section aria-labelledby="acoes" className="space-y-2">
          <h2 id="acoes" className="sr-only">
            Ações
          </h2>
          <div className="flex flex-wrap gap-3">
            {next.map((t) => (
              <ActionButton
                key={t.to}
                action={updateOrderStatus.bind(null, o.id, t.to)}
                variant={t.danger ? "outline" : "primary"}
                className={t.danger ? "text-error" : undefined}
                confirmText={t.danger ? `${t.label}? Essa ação não pode ser desfeita.` : undefined}
              >
                {t.label}
              </ActionButton>
            ))}
          </div>
          {o.status === "pending_payment" && (
            <p className="text-xs text-muted">O pagamento normalmente é confirmado pelo webhook do provedor. Use a confirmação manual só para pagamentos recebidos fora dele.</p>
          )}
        </section>
      )}

      <section aria-labelledby="itens" className="space-y-3">
        <h2 id="itens" className="font-display text-xl font-semibold">
          Itens
        </h2>
        <div className="overflow-x-auto rounded-card border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-4 py-2">Produto</th>
                <th scope="col" className="px-4 py-2">SKU</th>
                <th scope="col" className="px-4 py-2 text-right">Qtd.</th>
                <th scope="col" className="px-4 py-2 text-right">Unitário</th>
                <th scope="col" className="px-4 py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((it) => (
                <tr key={it.id}>
                  <td className="px-4 py-2">
                    {it.product_name}
                    {it.volume_ml ? ` ${it.volume_ml} ml` : ""} <span className="text-muted">· {it.brand_name}</span>
                  </td>
                  <td className="px-4 py-2 text-muted">{it.sku}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{it.quantity}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatBRL(it.unit_price_cents)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatBRL(it.line_total_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatBRL(o.subtotal_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Frete</dt>
            <dd className="tabular-nums">{formatBRL(o.shipping_cents)}</dd>
          </div>
          {o.discount_cents > 0 && (
            <div className="flex justify-between">
              <dt>Desconto{o.coupon_code ? ` (cupom ${o.coupon_code})` : ""}</dt>
              <dd className="tabular-nums text-success">−{formatBRL(o.discount_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-1 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBRL(o.total_cents)}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-6 text-sm sm:grid-cols-2">
        <div className="space-y-1">
          <h2 className="mb-2 font-display text-xl font-semibold">Cliente</h2>
          <p>{o.customer_name}</p>
          <p>{o.customer_email}</p>
          {o.customer_phone && <p>{o.customer_phone}</p>}
        </div>
        <div className="space-y-1">
          <h2 className="mb-2 font-display text-xl font-semibold">Entrega</h2>
          <p>
            {o.ship_street}, {o.ship_number}
            {o.ship_complement ? ` · ${o.ship_complement}` : ""}
          </p>
          <p>
            {o.ship_district} · {o.ship_city}/{o.ship_state} · CEP {o.ship_cep.replace(/(\d{5})(\d{3})/, "$1-$2")}
          </p>
          <p className="text-muted">
            {o.shipping_label} · {o.shipping_days_min} a {o.shipping_days_max} dias úteis
          </p>
        </div>
      </section>

      <section aria-labelledby="pagamentos" className="space-y-3">
        <h2 id="pagamentos" className="font-display text-xl font-semibold">
          Pagamentos
        </h2>
        {payments.length ? (
          <ul className="divide-y divide-border rounded-card border border-border text-sm">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <span>
                  <strong className="font-medium">{PAYMENT_METHODS[p.method]}</strong>
                  {p.card_last4 && ` · ${p.card_brand} final ${p.card_last4}`} · {formatBRL(p.amount_cents)}
                  <span className="text-muted"> · {p.provider_ref}</span>
                  {p.failure_reason && <span className="text-muted"> · {p.failure_reason}</span>}
                </span>
                <span className="flex items-center gap-2">
                  {p.needs_refund && <Badge variant="error">Estornar</Badge>}
                  <Badge variant={PAYMENT_STATUS[p.status].variant}>{PAYMENT_STATUS[p.status].label}</Badge>
                  <time dateTime={p.created_at} className="text-xs text-muted">
                    {formatDateTime(p.created_at)}
                  </time>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhuma tentativa de pagamento.</p>
        )}
      </section>

      <section aria-labelledby="historico" className="space-y-3">
        <h2 id="historico" className="font-display text-xl font-semibold">
          Histórico
        </h2>
        <ol className="divide-y divide-border rounded-card border border-border text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
              <span>
                <strong className="font-medium">{ORDER_STATUS[e.to_status as OrderStatus]?.label ?? e.to_status}</strong>
                <span className="text-muted">
                  {" "}
                  · {who(e.actor_id)}
                  {e.note && ` · ${e.note}`}
                </span>
              </span>
              <time dateTime={e.created_at} className="text-xs text-muted">
                {formatDateTime(e.created_at)}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
