import { Suspense } from "react";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/card";

export const metadata = { title: "Busca", robots: { index: false, follow: true } };

async function SearchHeading({ searchParams }: { searchParams: PageProps<"/buscar">["searchParams"] }) {
  const q = (await searchParams).q;
  const term = typeof q === "string" ? q.trim().slice(0, 80) : "";
  return <h1 className="mb-8 font-display text-4xl font-semibold">{term ? `Resultados para “${term}”` : "Buscar perfumes"}</h1>;
}

export default function BuscarPage(props: PageProps<"/buscar">) {
  return (
    <Container className="py-10">
      <Suspense fallback={<h1 className="mb-8 font-display text-4xl font-semibold">Buscar perfumes</h1>}>
        <SearchHeading searchParams={props.searchParams} />
      </Suspense>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CatalogResults basePath="/buscar" searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}
