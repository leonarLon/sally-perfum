import { Suspense } from "react";
import { CatalogResults } from "@/components/catalog/catalog-results";
import { ProductGridSkeleton } from "@/components/catalog/product-grid";
import { Container } from "@/components/ui/card";

export const metadata = {
  title: "Perfumes",
  description: "Perfumes femininos, masculinos e unissex, importados e nacionais. Filtre por família olfativa, marca e preço.",
  alternates: { canonical: "/produtos" },
};

export default function ProdutosPage(props: PageProps<"/produtos">) {
  return (
    <Container className="py-10">
      <h1 className="mb-8 font-display text-4xl font-semibold">Perfumes</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <CatalogResults basePath="/produtos" searchParams={props.searchParams} />
      </Suspense>
    </Container>
  );
}
