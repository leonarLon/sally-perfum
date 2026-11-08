import Link from "next/link";
import { AuditList } from "@/components/admin/audit-list";
import { requireRole } from "@/lib/auth/session";
import { getDashboardStats, listAudit } from "@/lib/admin/queries";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { user } = await requireRole();
  const [stats, audit] = await Promise.all([getDashboardStats(), listAudit({ limit: 12 })]);

  const cards = [
    { label: "Produtos publicados", value: stats.products_published, href: "/admin/produtos?status=published" },
    { label: "Rascunhos", value: stats.products_draft, href: "/admin/produtos?status=draft" },
    { label: "Variantes com estoque baixo", value: stats.low_stock, href: "/admin/estoque?status=low_stock" },
    { label: "Variantes esgotadas", value: stats.out_of_stock, href: "/admin/estoque?status=out_of_stock" },
  ];
  const pendencias = [
    { n: stats.reference_prices, text: "variantes ativas com preço de referência (não confirmado)", href: "/admin/produtos" },
    { n: stats.demo_stock, text: "variantes com estoque de demonstração (contagem não conferida)", href: "/admin/estoque" },
    { n: stats.review_pending, text: "produtos pendentes de revisão comercial", href: "/admin/produtos" },
  ].filter((p) => p.n > 0);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block rounded-card border border-border bg-surface p-5 transition-colors hover:border-primary">
              <span className="block text-3xl font-semibold tabular-nums">{c.value}</span>
              <span className="mt-1 block text-sm text-muted">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      {pendencias.length > 0 && (
        <section aria-labelledby="pendencias" className="rounded-card border border-warning/30 bg-warning/5 p-5">
          <h2 id="pendencias" className="font-semibold text-warning">
            Pendências antes do uso comercial
          </h2>
          <ul className="mt-2 space-y-1 text-sm">
            {pendencias.map((p) => (
              <li key={p.text}>
                <Link href={p.href} className="hover:underline">
                  <strong className="tabular-nums">{p.n}</strong> {p.text}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="atividade" className="space-y-3">
        <h2 id="atividade" className="font-display text-xl font-semibold">
          Atividade recente
        </h2>
        <AuditList entries={audit} currentUserId={user.id} />
      </section>
    </div>
  );
}
