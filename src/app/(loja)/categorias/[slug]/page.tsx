import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/card";
import { getCategory } from "@/lib/catalog/queries";

export async function generateMetadata(props: PageProps<"/categorias/[slug]">) {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return { title: "Categoria não encontrada" };
  return { title: category.name, alternates: { canonical: `/categorias/${slug}` } };
}

async function CategoryContent(props: PageProps<"/categorias/[slug]">) {
  const { slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();
  return (
    <>
      <h1 className="mb-8 font-display text-4xl font-semibold">{category.name}</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CatalogResults basePath={`/categorias/${slug}`} searchParams={props.searchParams} fixed={{ categoria: slug }} />
      </Suspense>
    </>
  );
}

export default function CategoriaPage(props: PageProps<"/categorias/[slug]">) {
  return (
    <Container className="py-10">
      <Suspense fallback={<ProductGridSkeleton />}>
        <CategoryContent {...props} />
      </Suspense>
    </Container>
  );
}
