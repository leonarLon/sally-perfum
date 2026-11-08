import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/card";
import { getBrand } from "@/lib/catalog/queries";

export async function generateMetadata(props: PageProps<"/marcas/[slug]">) {
  const { slug } = await props.params;
  const brand = await getBrand(slug);
  if (!brand) return { title: "Marca não encontrada" };
  return { title: `Perfumes ${brand.name}`, alternates: { canonical: `/marcas/${slug}` } };
}

async function BrandContent(props: PageProps<"/marcas/[slug]">) {
  const { slug } = await props.params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  return (
    <>
      <p className="text-sm uppercase tracking-[0.2em] text-primary">Marca</p>
      <h1 className="mb-8 font-display text-4xl font-semibold">{brand.name}</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CatalogResults basePath={`/marcas/${slug}`} searchParams={props.searchParams} fixed={{ marca: slug }} />
      </Suspense>
    </>
  );
}

export default function MarcaPage(props: PageProps<"/marcas/[slug]">) {
  return (
    <Container className="py-10">
      <Suspense fallback={<ProductGridSkeleton />}>
        <BrandContent {...props} />
      </Suspense>
    </Container>
  );
}
