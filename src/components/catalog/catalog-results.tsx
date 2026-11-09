import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { hasActiveFilters, parseCatalogParams, PAGE_SIZE, type CatalogFilters as Filters } from "@/lib/catalog/params";
import { getFacets, searchCatalog } from "@/lib/catalog/queries";
import { CatalogFilters } from "./catalog-filters";
import { Pagination } from "./pagination";
import { ProductGrid } from "./product-grid";
import { SortSelect } from "./sort-select";

type Fixed = Partial<Pick<Filters, "marca" | "categoria" | "q">>;

/**
 * Listagem completa (filtros + ordenação + grade + paginação) a partir dos searchParams.
 * Deve ser renderizada dentro de <Suspense>, pois lê dados da requisição.
 */
export async function CatalogResults({
  basePath,
  searchParams,
  fixed = {},
}: {
  basePath: string;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  fixed?: Fixed;
}) {
  const filters: Filters = { ...parseCatalogParams(await searchParams), ...fixed };
  const [page, facets] = await Promise.all([searchCatalog(filters), getFacets()]);
  // Filtros fixos já estão no caminho da URL (ex.: /marcas/dior) e não vão para a query string.
  const linkFilters: Filters = { ...filters };
  if (fixed.marca) delete linkFilters.marca;
  if (fixed.categoria) delete linkFilters.categoria;

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <details className="group rounded-card border border-border p-4 lg:border-0 lg:p-0" open>
          <summary className="cursor-pointer font-semibold lg:hidden">Filtros</summary>
          <div className="mt-4 lg:mt-0">
            <CatalogFilters basePath={basePath} filters={filters} facets={facets} fixed={fixed} />
          </div>
        </details>
      </aside>

      <section aria-labelledby="resultados-titulo">
        {/* Título para leitores de tela: mantém a hierarquia h1 → h2 → h3 (títulos dos cards). */}
        <h2 id="resultados-titulo" className="sr-only">
          Resultados
        </h2>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p id="resultados" className="text-sm text-muted" role="status">
            {page.total === 1 ? "1 perfume encontrado" : `${page.total} perfumes encontrados`}
            {filters.q ? <> para “<strong className="text-text">{filters.q}</strong>”</> : null}
          </p>
          <SortSelect basePath={basePath} filters={linkFilters} />
        </div>

        {page.items.length ? (
          <>
            <ProductGrid items={page.items} priorityCount={4} />
            <Pagination basePath={basePath} filters={linkFilters} page={page.page} pageSize={PAGE_SIZE} total={page.total} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-card border border-dashed border-border py-16 text-center">
            <SearchX className="size-10 text-muted" aria-hidden />
            <div>
              <p className="font-semibold">Nenhum perfume encontrado</p>
              <p className="text-sm text-muted">
                {hasActiveFilters(filters) ? "Tente remover alguns filtros ou buscar por outro termo." : "O catálogo ainda está vazio."}
              </p>
            </div>
            {hasActiveFilters(filters) ? (
              <Button asChild variant="outline" size="sm">
                <Link href="/produtos">Ver todos os perfumes</Link>
              </Button>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
