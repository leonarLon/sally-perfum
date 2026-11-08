import type { ProductDetail } from "@/lib/catalog/types";

/** Pirâmide olfativa. Nunca preenche lacunas: quando não confirmada, diz isso. */
export function OlfactoryInfo({ product }: { product: ProductDetail }) {
  const levels = [
    { label: "Notas de saída", notes: product.top_notes },
    { label: "Notas de corpo", notes: product.heart_notes },
    { label: "Notas de fundo", notes: product.base_notes },
  ];
  const hasPyramid = levels.some((l) => l.notes?.length);

  return (
    <section aria-labelledby="olfativo" className="space-y-4">
      <h2 id="olfativo" className="font-display text-2xl font-semibold">Informações olfativas</h2>
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <Info label="Família olfativa" value={product.olfactory_family} />
        <Info label="Concentração" value={product.concentration} />
        <Info label="Para quem" value={product.gender[0].toUpperCase() + product.gender.slice(1)} />
        <Info label="Origem" value={product.origin === "nacional" ? "Nacional" : "Importado"} />
        {product.occasion ? <Info label="Ocasião" value={product.occasion} /> : null}
      </dl>

      {hasPyramid ? (
        <ol className="space-y-3">
          {levels.map((l) => (
            <li key={l.label} className="rounded-card border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{l.label}</p>
              <p className="mt-1">{l.notes?.length ? l.notes.join(", ") : <span className="text-muted">Não confirmado</span>}</p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-card border border-dashed border-border p-4 text-sm">
          <p className="text-muted">A pirâmide olfativa completa deste perfume não foi confirmada por fonte confiável.</p>
          {product.highlights?.length ? (
            <p className="mt-2">
              <span className="font-semibold">Ingredientes em destaque: </span>
              {product.highlights.join(", ")}
            </p>
          ) : null}
        </div>
      )}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-card bg-surface p-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium">{value ?? <span className="font-normal text-muted">Não informado</span>}</dd>
    </div>
  );
}
