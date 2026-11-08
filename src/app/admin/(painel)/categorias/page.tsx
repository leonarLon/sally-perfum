import { TaxonomyForm } from "@/components/admin/taxonomy-form";
import { listCategories } from "@/lib/admin/queries";
import { saveCategory } from "../marcas/actions";

export const metadata = { title: "Categorias" };

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Categorias</h1>
        <p className="mt-1 text-sm text-muted">Desativar uma categoria oculta da loja todos os produtos dela.</p>
      </div>
      <section aria-labelledby="nova-categoria" className="rounded-card border border-dashed border-border p-4">
        <h2 id="nova-categoria" className="mb-3 font-medium">
          Nova categoria
        </h2>
        <TaxonomyForm action={saveCategory.bind(null, null)} withCategoryFields label="Nova categoria" />
      </section>
      <ul className="space-y-3">
        {categories.map((c) => (
          <li key={c.id} className="rounded-card border border-border p-4">
            <TaxonomyForm action={saveCategory.bind(null, c.id)} item={c} withCategoryFields label={`Categoria ${c.name}`} />
          </li>
        ))}
      </ul>
    </div>
  );
}
