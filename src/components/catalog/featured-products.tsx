import Link from "next/link";
import { searchCatalogSafe } from "@/lib/catalog/queries";
import { ProductGrid } from "./product-grid";

/**
 * Vitrine da home (dados do Supabase, cacheados e invalidados pela tag "catalog").
 * Se o catálogo estiver indisponível, mostra aviso (o cache dessa falha expira em minutos).
 */
export async function FeaturedProducts() {
  const page = await searchCatalogSafe({ disponivel: "1" }, { p_page_size: 8 });

  if (!page) {
    return (
      <p className="rounded-card border border-dashed border-border p-6 text-center text-sm text-muted" role="status">
        O catálogo está temporariamente indisponível.
      </p>
    );
  }
  if (!page.items.length) return null;
  return (
    <section aria-labelledby="destaques" className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <h2 id="destaques" className="font-display text-3xl font-semibold">Destaques</h2>
        <Link href="/produtos" className="text-sm font-medium text-primary hover:underline">Ver todos</Link>
      </div>
      <ProductGrid items={page.items} />
    </section>
  );
}
