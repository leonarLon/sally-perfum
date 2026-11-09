import { CouponForm } from "@/components/admin/coupon-form";
import { formatDateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { listCoupons, type AdminCoupon } from "@/lib/admin/queries";
import { formatBRL } from "@/lib/money";
import { saveCoupon } from "./actions";

export const metadata = { title: "Cupons" };

function discountText(c: AdminCoupon) {
  if (c.kind === "percent") return `${c.percent_off}% de desconto${c.max_discount_cents ? ` (até ${formatBRL(c.max_discount_cents)})` : ""}`;
  return `${formatBRL(c.amount_off_cents ?? 0)} de desconto`;
}

const COUPON_STATE = {
  active: { label: "Valendo", variant: "success" },
  inactive: { label: "Inativo", variant: "outline" },
  expired: { label: "Expirado", variant: "outline" },
  scheduled: { label: "Agendado", variant: "warning" },
  exhausted: { label: "Esgotado", variant: "warning" },
} as const;

export default async function CouponsPage() {
  const coupons = await listCoupons();
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Cupons</h1>
        <p className="mt-1 text-sm text-muted">
          O desconto vale sobre os produtos, nunca sobre o frete, e é calculado no banco. Cupons não são apagados: desative para encerrar.
        </p>
      </div>
      <section aria-labelledby="novo-cupom" className="rounded-card border border-dashed border-border p-4">
        <h2 id="novo-cupom" className="mb-3 font-medium">
          Novo cupom
        </h2>
        <CouponForm action={saveCoupon.bind(null, null)} label="Novo cupom" />
      </section>
      <section aria-labelledby="cupons-cadastrados" className="space-y-3">
        <h2 id="cupons-cadastrados" className="font-medium">
          Cadastrados ({coupons.length})
        </h2>
        {coupons.length === 0 && <p className="text-sm text-muted">Nenhum cupom cadastrado.</p>}
        <ul className="space-y-3">
          {coupons.map((c) => {
            const st = COUPON_STATE[c.state];
            return (
              <li key={c.id} className="rounded-card border border-border">
                <details>
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-4">
                    <span className="font-mono font-semibold">{c.code}</span>
                    <Badge variant={st.variant}>{st.label}</Badge>
                    {c.is_demo && <Badge variant="outline">demonstração</Badge>}
                    <span className="text-sm">{discountText(c)}</span>
                    <span className="text-sm text-muted">
                      {c.min_subtotal_cents > 0 ? `mínimo ${formatBRL(c.min_subtotal_cents)} · ` : ""}
                      {c.uses} {c.uses === 1 ? "uso" : "usos"}
                      {c.max_uses ? ` de ${c.max_uses}` : ""}
                      {c.ends_at ? ` · até ${formatDateTime(c.ends_at)}` : ""}
                      {c.discount_given_cents > 0 ? ` · ${formatBRL(c.discount_given_cents)} concedidos em pedidos pagos` : ""}
                    </span>
                  </summary>
                  <div className="border-t border-border p-4">
                    <CouponForm action={saveCoupon.bind(null, c.id)} coupon={c} label={`Cupom ${c.code}`} />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
