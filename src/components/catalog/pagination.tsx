import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { buildQuery, type CatalogFilters } from "@/lib/catalog/params";
import { cn } from "@/lib/utils";

export function Pagination({
  basePath,
  filters,
  page,
  pageSize,
  total,
}: {
  basePath: string;
  filters: CatalogFilters;
  page: number;
  pageSize: number;
  total: number;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  const href = (p: number) => `${basePath}${buildQuery(filters, { pagina: p === 1 ? null : p })}`;
  const window = Array.from({ length: pages }, (_, i) => i + 1).filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1);

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1 pt-8">
      {page > 1 ? (
        <Link href={href(page - 1)} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface" aria-label="Página anterior">
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
      {window.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && p - window[i - 1] > 1 ? <span className="px-1 text-muted">…</span> : null}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex size-10 items-center justify-center rounded-full text-sm",
              p === page ? "bg-primary text-primary-foreground" : "hover:bg-surface",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} className="inline-flex size-10 items-center justify-center rounded-full hover:bg-surface" aria-label="Próxima página">
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
