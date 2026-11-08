import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { OlfactoryInfo } from "@/components/catalog/olfactory-info";
import { ProductGallery } from "@/components/catalog/product-gallery";
import { ProductGrid, ProductGridSkeleton } from "@/components/catalog/product-grid";
import { PurchasePanel } from "@/components/catalog/purchase-panel";
import { Container, Skeleton } from "@/components/ui/card";
import { resolveImageUrl } from "@/lib/catalog/images";
import { getProduct, getRelated } from "@/lib/catalog/queries";
import type { ProductDetail } from "@/lib/catalog/types";
import { getSiteUrl } from "@/lib/env";

export async function generateMetadata(props: PageProps<"/produtos/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return { title: "Perfume não encontrado", robots: { index: false } };
  const image = resolveImageUrl(product.images[0]);
  const title = `${product.name} ${product.brand.name}${product.concentration ? ` ${product.concentration}` : ""}`;
  return {
    title,
    description: product.short_description ?? undefined,
    alternates: { canonical: `/produtos/${product.slug}` },
    openGraph: { title, description: product.short_description ?? undefined, images: image ? [image] : undefined },
  };
}

/** Dados estruturados schema.org/Product (preço e disponibilidade reais do banco). */
function ProductJsonLd({ product }: { product: ProductDetail }) {
  const url = `${getSiteUrl()}/produtos/${product.slug}`;
  const availability = (s: string) =>
    s === "out_of_stock" ? "https://schema.org/OutOfStock" : s === "low_stock" ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock";
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand.name },
    description: product.description ?? product.short_description,
    image: product.images.map((i) => resolveImageUrl(i)).filter(Boolean),
    url,
    offers: product.variants.map((v) => ({
      "@type": "Offer",
      sku: v.sku,
      price: (v.price_cents / 100).toFixed(2),
      priceCurrency: "BRL",
      availability: availability(v.stock_status),
      url,
    })),
  };
  // JSON.stringify + escape de "<" evita quebra do <script> por conteúdo do banco.
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}

async function Related({ product }: { product: ProductDetail }) {
  const items = await getRelated(product);
  if (!items.length) return null;
  return (
    <section aria-labelledby="relacionados" className="space-y-6">
      <h2 id="relacionados" className="font-display text-3xl font-semibold">Você também pode gostar</h2>
      <ProductGrid items={items} />
    </section>
  );
}

async function ProductContent({ params }: { params: PageProps<"/produtos/[slug]">["params"] }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const images = product.images.map((img) => ({ src: resolveImageUrl(img), alt: img.alt }));
  return (
    <>
      <ProductJsonLd product={product} />
      <nav aria-label="Trilha de navegação" className="mb-6 text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/produtos" className="hover:text-primary">Perfumes</Link></li>
          <li aria-hidden><ChevronRight className="size-3" /></li>
          <li><Link href={`/categorias/${product.category.slug}`} className="hover:text-primary">{product.category.name}</Link></li>
          <li aria-hidden><ChevronRight className="size-3" /></li>
          <li aria-current="page" className="text-text">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={images} name={product.name} />
        <div className="space-y-6">
          <div className="space-y-2">
            <Link href={`/marcas/${product.brand.slug}`} className="text-sm font-semibold uppercase tracking-wider text-primary hover:underline">
              {product.brand.name}
            </Link>
            <h1 className="font-display text-4xl font-semibold leading-tight">{product.name}</h1>
            {product.concentration ? <p className="text-muted">{product.concentration}</p> : null}
            {product.short_description ? <p className="text-lg">{product.short_description}</p> : null}
          </div>
          <PurchasePanel variants={product.variants} />
        </div>
      </div>

      <div className="mt-16 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="descricao" className="space-y-3">
          <h2 id="descricao" className="font-display text-2xl font-semibold">Descrição</h2>
          <p className="leading-relaxed text-text">{product.description}</p>
        </section>
        <OlfactoryInfo product={product} />
      </div>

      <div className="mt-16">
        <Suspense fallback={<ProductGridSkeleton count={4} />}>
          <Related product={product} />
        </Suspense>
      </div>
    </>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2" role="status" aria-busy="true" aria-label="Carregando perfume">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}

export default function ProdutoPage(props: PageProps<"/produtos/[slug]">) {
  return (
    <Container className="py-8">
      <Suspense fallback={<ProductSkeleton />}>
        <ProductContent params={props.params} />
      </Suspense>
    </Container>
  );
}
