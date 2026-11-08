import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { CatalogFilters } from "@/lib/catalog/params";
import type { CatalogFacets } from "@/lib/catalog/types";

type Fixed = Partial<Pick<CatalogFilters, "marca" | "categoria" | "q">>;

/**
 * Filtros como formulário GET: funcionam sem JavaScript, geram URLs compartilháveis
 * e indexáveis. Filtros "fixos" (ex.: marca na página da marca) não aparecem.
 */
export function CatalogFilters({
  basePath,
  filters,
  facets,
  fixed = {},
}: {
  basePath: string;
  filters: CatalogFilters;
  facets: CatalogFacets;
  fixed?: Fixed;
}) {
  return (
    <form action={basePath} method="get" className="space-y-6 text-sm" aria-label="Filtrar perfumes">
      {filters.q && !fixed.q ? <input type="hidden" name="q" value={filters.q} /> : null}
      {filters.ordem ? <input type="hidden" name="ordem" value={filters.ordem} /> : null}

      <Fieldset legend="Para quem">
        {(["feminino", "masculino", "unissex"] as const).map((g) => (
          <Radio key={g} name="genero" value={g} checked={filters.genero === g} label={g[0].toUpperCase() + g.slice(1)} />
        ))}
        <Radio name="genero" value="" checked={!filters.genero} label="Todos" />
      </Fieldset>

      <Fieldset legend="Origem">
        <Radio name="origem" value="importado" checked={filters.origem === "importado"} label="Importados" />
        <Radio name="origem" value="nacional" checked={filters.origem === "nacional"} label="Nacionais" />
        <Radio name="origem" value="" checked={!filters.origem} label="Todas" />
      </Fieldset>

      {facets.families.length ? (
        <Fieldset legend="Família olfativa">
          <select name="familia" aria-label="Família olfativa" defaultValue={filters.familia ?? ""} className="h-10 w-full rounded-full border border-border bg-background px-3">
            <option value="">Todas</option>
            {facets.families.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name} ({f.count})
              </option>
            ))}
          </select>
        </Fieldset>
      ) : null}

      {!fixed.marca ? (
        <Fieldset legend="Marca">
          <select name="marca" aria-label="Marca" defaultValue={filters.marca ?? ""} className="h-10 w-full rounded-full border border-border bg-background px-3">
            <option value="">Todas</option>
            {facets.brands.map((b) => (
              <option key={b.slug} value={b.slug}>
                {b.name} ({b.count})
              </option>
            ))}
          </select>
        </Fieldset>
      ) : null}

      <Fieldset legend="Preço (R$)">
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="preco-min">Preço mínimo</label>
          <input id="preco-min" name="min" type="number" inputMode="numeric" min={0} placeholder="Mín." defaultValue={filters.min}
            className="h-10 w-full rounded-full border border-border px-3" />
          <span aria-hidden>–</span>
          <label className="sr-only" htmlFor="preco-max">Preço máximo</label>
          <input id="preco-max" name="max" type="number" inputMode="numeric" min={0} placeholder="Máx." defaultValue={filters.max}
            className="h-10 w-full rounded-full border border-border px-3" />
        </div>
      </Fieldset>

      <Fieldset legend="Outros">
        <Check name="promocao" checked={filters.promocao === "1"} label="Em promoção" />
        <Check name="disponivel" checked={filters.disponivel === "1"} label="Somente disponíveis" />
      </Fieldset>

      <div className="flex gap-2">
        <Button type="submit" size="sm" className="flex-1">Aplicar filtros</Button>
        <Button asChild type="button" size="sm" variant="ghost">
          <Link href={fixed.q ? `${basePath}?q=${encodeURIComponent(fixed.q)}` : basePath}>Limpar</Link>
        </Button>
      </div>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Radio({ name, value, checked, label }: { name: string; value: string; checked: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="radio" name={name} value={value} defaultChecked={checked} className="size-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}

function Check({ name, checked, label }: { name: string; checked: boolean; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <input type="checkbox" name={name} value="1" defaultChecked={checked} className="size-4 accent-[var(--primary)]" />
      {label}
    </label>
  );
}
