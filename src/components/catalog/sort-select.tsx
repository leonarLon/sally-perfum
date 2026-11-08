"use client";
import { useRouter } from "next/navigation";
import { SORTS, buildQuery, type CatalogFilters, type Sort } from "@/lib/catalog/params";

/** Ordenação: navega mantendo os filtros (funciona sem JS via botão do formulário de filtros). */
export function SortSelect({ basePath, filters }: { basePath: string; filters: CatalogFilters }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Ordenar por</span>
      <select
        className="h-10 rounded-full border border-border bg-background px-3 text-sm"
        value={filters.ordem ?? "relevance"}
        onChange={(e) => {
          const value = e.target.value as Sort;
          router.push(`${basePath}${buildQuery(filters, { ordem: value === "relevance" ? null : value })}`);
        }}
      >
        {Object.entries(SORTS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
