import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { listBrands } from "@/lib/admin/queries";
import { saveBrand } from "./actions";

export const metadata = { title: "Marcas" };

export default async function BrandsPage() {
  const brands = await listBrands();
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Marcas</h1>
        <p className="mt-1 text-sm text-muted">Desativar uma marca oculta da loja todos os produtos dela.</p>
      </div>
      <section aria-labelledby="nova-marca" className="rounded-card border border-dashed border-border p-4">
        <h2 id="nova-marca" className="mb-3 font-medium">
          Nova marca
        </h2>
        <TaxonomyForm action={saveBrand.bind(null, null)} label="Nova marca" />
      </section>
      <ul className="space-y-3">
        {brands.map((b) => (
          <li key={b.id} className="rounded-card border border-border p-4">
            <TaxonomyForm action={saveBrand.bind(null, b.id)} item={b} label={`Marca ${b.name}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
