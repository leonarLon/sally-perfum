import Link from "next/link";
import { formatDateTime } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE_SIZE, listOrders } from "@/lib/admin/queries";
import { PAYMENT_METHODS } from "@/lib/checkout/schemas";
import { ORDER_STATUS } from "@/lib/checkout/status";
import { formatBRL } from "@/lib/money";

export const metadata = { title: "Pedidos" };

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.pagina) || 1);
  const { items, total } = await listOrders({ q, status, page });
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const href = (p: number) => `/admin/pedidos?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), pagina: String(p) })}`;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Pedidos</h1>
      <form className="flex flex-wrap gap-3" role="search" aria-label="Filtrar pedidos">
        <Input name="q" defaultValue={q} placeholder="Nº do pedido ou e-mail" aria-label="Buscar pedidos" className="max-w-sm" />
        <select name="status" defaultValue={status} aria-label="Situação" className="h-11 rounded-full border border-border bg-background px-4 text-sm">
          <option value="">Todas as situações</option>
          {Object.entries(ORDER_STATUS).map(([v, s]) => (
            <option key={v} value={v}>
              {s.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>
      <p className="text-sm text-muted" role="status">
        {total} {total === 1 ? "pedido" : "pedidos"}
      </p>

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Pedido</th>
              <th scope="col" className="px-4 py-3">Cliente</th>
              <th scope="col" className="px-4 py-3">Situação</th>
              <th scope="col" className="px-4 py-3">Total</th>
              <th scope="col" className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((o) => {
              const st = ORDER_STATUS[o.status];
              const units = o.items.reduce((n, i) => n + i.quantity, 0);
              return (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pedidos/${o.id}`} className="font-medium text-primary hover:underline">
                      #{o.number}
                    </Link>
                    <p className="text-xs text-muted">
                      {units} {units === 1 ? "unidade" : "unidades"} · {PAYMENT_METHODS[o.payment_method]}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {o.customer_name}
                    <p className="text-xs text-muted">{o.customer_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatBRL(o.total_cents)}</td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(o.created_at)}</td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <nav aria-label="Paginação" className="flex flex-wrap gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === page ? "page" : undefined}
              className={`rounded-full px-3 py-1 text-sm ${p === page ? "bg-primary text-primary-foreground" : "border border-border hover:bg-surface"}`}
            >
              {p}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
