import Link from "next/link";
import { STOCK_STATUS, formatDateTime } from "@/components/admin/labels";
import { StockForm } from "@/components/admin/stock-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listInventory } from "@/lib/admin/queries";
import { updateStock } from "./actions";

export const metadata = { title: "Estoque" };

export default async function StockPage({ searchParams }: PageProps<"/admin/estoque">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 80) : "";
  const status = typeof sp.status === "string" ? sp.status : "";
  const rows = await listInventory({ q, status });
  const demo = rows.filter((r) => r.is_demo_quantity).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Estoque</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Use <strong>contagem conferida</strong> para registrar a quantidade real (deixa de ser demonstração) e{" "}
          <strong>entrada de mercadoria</strong> para somar o que chegou. Toda alteração gera movimentação com autor e motivo.
          A loja mostra ao cliente só o status, nunca a quantidade.
        </p>
      </div>

      <form className="flex flex-wrap gap-3" role="search" aria-label="Filtrar estoque">
        <Input name="q" defaultValue={q} placeholder="Produto, marca ou SKU" aria-label="Buscar no estoque" className="max-w-sm" />
        <select name="status" defaultValue={status} aria-label="Situação" className="h-11 rounded-full border border-border bg-background px-4 text-sm">
          <option value="">Todas as situações</option>
          <option value="out_of_stock">Esgotado</option>
          <option value="low_stock">Baixo</option>
          <option value="in_stock">Em estoque</option>
        </select>
        <Button type="submit" variant="outline">
          Filtrar
        </Button>
      </form>

      <p className="text-sm text-muted" role="status">
        {rows.length} variantes{demo > 0 && ` · ${demo} com quantidade de demonstração`}
      </p>

      <ul className="space-y-3">
        {rows.map((r) => {
          const ss = STOCK_STATUS[r.stock_status];
          return (
            <li key={r.variant_id} className="rounded-card border border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/admin/produtos/${r.product_id}`} className="font-medium hover:text-primary hover:underline">
                    {r.product_name}
                  </Link>
                  <p className="text-xs text-muted">
                    {r.brand_name} · {r.volume_ml ? `${r.volume_ml} ml` : "—"} · {r.sku}
                    {!r.variant_active && " · variante inativa"}
                    {r.product_status !== "published" && " · produto fora da loja"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant={ss.variant}>{ss.label}</Badge>
                  {r.is_demo_quantity && <Badge variant="outline">Demo</Badge>}
                  <span className="tabular-nums">
                    <strong>{r.available}</strong> disp. · {r.on_hand} total · {r.reserved} res. · mín. {r.min_stock}
                  </span>
                </div>
              </div>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-primary">
                  Ajustar <span className="sr-only">{r.sku}</span>
                  {r.updated_at && <span className="ml-2 text-xs text-muted">atualizado em {formatDateTime(r.updated_at)}</span>}
                </summary>
                <div className="mt-3">
                  <StockForm key={`${r.on_hand}-${r.min_stock}-${r.updated_at}`} action={updateStock} row={r} compact />
                </div>
              </details>
            </li>
          );
        })}
        {!rows.length && <li className="py-10 text-center text-muted">Nenhuma variante encontrada.</li>}
      </ul>
    </div>
  );
}
