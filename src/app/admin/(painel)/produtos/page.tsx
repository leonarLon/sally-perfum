import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCT_STATUS } from "@/components/admin/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_PAGE_SIZE, listAdminProducts } from "@/lib/admin/queries";
import { resolveImageUrl } from "@/lib/catalog/images";
import { formatBRL } from "@/lib/money";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/produtos">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const page = Math.max(1, Number(sp.pagina) || 1);
  const { items, total } = await listAdminProducts({ q, status, page });
  const pages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));
  const href = (p: number) => `/admin/produtos?${new URLSearchParams({ ...(q && { q }), ...(status && { status }), pagina: String(p) })}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Produtos</h1>
        <Button asChild>
          <Link href="/admin/produtos/novo">
            <Plus aria-hidden /> Novo produto
          </Link>
        </Button>
      </div>

      <form className="flex flex-wrap gap-3" role="search" aria-label="Filtrar produtos">
        <Input name="q" defaultValue={q} placeholder="Buscar por nome, marca ou nota" aria-label="Buscar produtos" className="max-w-sm" />
        <select
          name="status"
          defaultValue={status}
          aria-label="Status"
          className="h-11 rounded-full border border-border bg-background px-4 text-sm"
        >
          <option value="">Todos os status</option>
          <option value="published">Publicados</option>
          <option value="draft">Rascunhos</option>
          <option value="archived">Arquivados</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <p className="text-sm text-muted" role="status">
        {total} {total === 1 ? "produto" : "produtos"}
      </p>

      <div className="overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Produto</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Preço</th>
              <th scope="col" className="px-4 py-3">Revisão</th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((p) => {
              const active = p.variants.filter((v) => v.is_active);
              const prices = active.map((v) => v.price_cents);
              const min = prices.length ? Math.min(...prices) : null;
              const refCount = active.filter((v) => v.price_is_reference).length;
              const img = resolveImageUrl(p.images.find((i) => i.is_primary) ?? p.images[0]);
              const st = PRODUCT_STATUS[p.status];
              return (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface">
                        {img && <Image src={img} alt="" fill sizes="48px" className="object-contain" />}
                      </div>
                      <div>
                        <Link href={`/admin/produtos/${p.id}`} className="font-medium hover:text-primary hover:underline">
                          {p.name}
                        </Link>
                        <p className="text-xs text-muted">
                          {p.brand?.name} · {p.category?.name}
                          {p.featured && " · destaque"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={st.variant}>{st.label}</Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {min === null ? <span className="text-muted">sem variante</span> : `a partir de ${formatBRL(min)}`}
                    {refCount > 0 && <p className="text-xs text-warning">{refCount} de referência</p>}
                  </td>
                  <td className="px-4 py-3">{p.commercial_review === "approved" ? "Aprovado" : <span className="text-muted">Pendente</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/produtos/${p.id}`} className="text-primary hover:underline" aria-label={`Editar ${p.name}`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted">
                  Nenhum produto encontrado.
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
