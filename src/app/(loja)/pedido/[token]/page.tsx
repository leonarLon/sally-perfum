import { CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PaymentPanel, type PublicPayment } from "@/components/cart/payment-panel";
import { Badge } from "@/components/ui/badge";
import { Container, Skeleton } from "@/components/ui/card";
import { PAYMENT_METHODS } from "@/lib/checkout/schemas";
import { ORDER_STATUS } from "@/lib/checkout/status";
import { formatBRL } from "@/lib/money";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata = { title: "Acompanhar pedido", robots: { index: false, follow: false } };


type PublicOrder = {
  number: number;
  status: keyof typeof ORDER_STATUS;
  created_at: string;
  reserved_until: string | null;
  customer_name: string;
  customer_email: string;
  ship_city: string;
  ship_state: string;
  ship_cep_masked: string;
  shipping_label: string;
  shipping_days_min: number;
  shipping_days_max: number;
  payment_method: keyof typeof PAYMENT_METHODS;
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  coupon_code: string | null;
  total_cents: number;
  is_demo: boolean;
  payment: (NonNullable<PublicPayment> & { amount_cents: number }) | null;
  items: { sku: string; product_name: string; brand_name: string; product_slug: string; volume_ml: number | null; unit_price_cents: number; quantity: number; line_total_cents: number }[];
  events: { status: keyof typeof ORDER_STATUS; at: string }[];
};

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export default function OrderPage({ params, searchParams }: PageProps<"/pedido/[token]">) {
  return (
    <Container className="max-w-3xl py-10">
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <OrderDetails params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}

async function OrderDetails({ params, searchParams }: PageProps<"/pedido/[token]">) {
  const [{ token }, sp] = await Promise.all([params, searchParams]);
  // O token (64 hex) é a credencial: a função valida o formato e não devolve dados sensíveis.
  const { data, error } = await createPublicClient().rpc("get_order_public", { p_token: token });
  if (error) throw new Error("Não foi possível carregar o pedido.");
  if (!data) notFound();
  const o = data as PublicOrder;
  const st = ORDER_STATUS[o.status];

  return (
    <div className="space-y-8">
      {sp.novo === "1" && (
        <div role="status" className="flex gap-3 rounded-card bg-success/10 p-4 text-success">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-semibold">Pedido recebido!</p>
            <p>Guarde o endereço desta página: é por ele que você acompanha o pedido sem precisar de cadastro.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold">Pedido #{o.number}</h1>
        <Badge variant={st.variant}>{st.label}</Badge>
      </div>

      {o.status === "pending_payment" && o.reserved_until && (
        <p className="flex gap-2 rounded-card border border-warning/30 bg-warning/5 p-4 text-sm">
          <Clock className="size-5 shrink-0 text-warning" aria-hidden />
          <span>
            Os produtos estão reservados até <strong>{dateFmt.format(new Date(o.reserved_until))}</strong>. Pague até lá
            para garantir o pedido.
          </span>
        </p>
      )}

      {o.status === "pending_payment" && <PaymentPanel token={token} payment={o.payment} preferred={o.payment_method} />}

      {o.payment?.status === "approved" && o.status !== "pending_payment" && (
        <p role="status" className="flex gap-2 rounded-card bg-success/10 p-4 text-sm text-success">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden />
          Pagamento aprovado ({PAYMENT_METHODS[o.payment.method]}
          {o.payment.card_last4 ? `, cartão final ${o.payment.card_last4}` : ""}).
        </p>
      )}
      {o.payment?.status === "refunded" && (
        <p role="status" className="rounded-card bg-surface p-4 text-sm">Pagamento estornado (simulado).</p>
      )}

      <section aria-labelledby="itens-pedido">
        <h2 id="itens-pedido" className="mb-3 font-display text-xl font-semibold">
          Itens
        </h2>
        <ul className="divide-y divide-border border-y border-border text-sm">
          {o.items.map((it) => (
            <li key={it.sku} className="flex justify-between gap-4 py-3">
              <span>
                {it.quantity}× <Link href={`/produtos/${it.product_slug}`} className="hover:text-primary">{it.product_name}</Link>
                {it.volume_ml ? ` ${it.volume_ml} ml` : ""} <span className="text-muted">· {it.brand_name}</span>
              </span>
              <span className="tabular-nums">{formatBRL(it.line_total_cents)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt>Subtotal</dt>
            <dd className="tabular-nums">{formatBRL(o.subtotal_cents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Frete ({o.shipping_label})</dt>
            <dd className="tabular-nums">{o.shipping_cents === 0 ? "Grátis" : formatBRL(o.shipping_cents)}</dd>
          </div>
          {o.discount_cents > 0 && (
            <div className="flex justify-between">
              <dt>Desconto{o.coupon_code ? ` (cupom ${o.coupon_code})` : ""}</dt>
              <dd className="tabular-nums text-success">−{formatBRL(o.discount_cents)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatBRL(o.total_cents)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="entrega" className="grid gap-6 sm:grid-cols-2 text-sm">
        <div>
          <h2 id="entrega" className="mb-2 font-display text-xl font-semibold">
            Entrega
          </h2>
          <p>{o.customer_name}</p>
          <p className="text-muted">
            {o.ship_city}/{o.ship_state} · CEP {o.ship_cep_masked}
          </p>
          <p className="text-muted">
            Prazo estimado: {o.shipping_days_min} a {o.shipping_days_max} dias úteis após o pagamento
          </p>
        </div>
        <div>
          <h2 className="mb-2 font-display text-xl font-semibold">Histórico</h2>
          <ol className="space-y-1">
            {o.events.map((e, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{ORDER_STATUS[e.status]?.label ?? e.status}</span>
                <time dateTime={e.at} className="text-muted">
                  {dateFmt.format(new Date(e.at))}
                </time>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {o.is_demo && <p className="text-xs text-muted">Pedido de demonstração: nenhum valor foi cobrado e nada será entregue.</p>}
    </div>
  );
}
