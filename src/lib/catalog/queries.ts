import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { CatalogFacets, CatalogPage, ProductDetail } from "./types";
import { toSearchArgs, type CatalogFilters } from "./params";

/**
 * Leituras públicas do catálogo. Fonte única de verdade: Supabase (RPCs SECURITY INVOKER
 * com RLS do papel anon). Cache por argumentos + tags, invalidadas pelo admin:
 *   - "catalog"            → qualquer mudança de catálogo
 *   - "product:<slug>"     → mudança em um produto específico
 */
export const CATALOG_TAG = "catalog";
export const productTag = (slug: string) => `product:${slug}`;

export class CatalogUnavailableError extends Error {
  constructor(cause: unknown) {
    super("Não foi possível carregar o catálogo agora.");
    this.name = "CatalogUnavailableError";
    this.cause = cause;
  }
}

export async function searchCatalog(filters: CatalogFilters, overrides: Record<string, unknown> = {}): Promise<CatalogPage> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient().rpc("search_catalog", toSearchArgs(filters, overrides));
  if (error) throw new CatalogUnavailableError(error);
  return data as CatalogPage;
}

/**
 * Variante que não lança erro (para conteúdo prerenderizado, como a vitrine da home).
 * Em falha, devolve null e expira o cache em minutos, para não fixar o erro por horas.
 */
export async function searchCatalogSafe(filters: CatalogFilters, overrides: Record<string, unknown> = {}): Promise<CatalogPage | null> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient().rpc("search_catalog", toSearchArgs(filters, overrides));
  if (error) {
    cacheLife("minutes");
    return null;
  }
  cacheLife("hours");
  return data as CatalogPage;
}

export async function getProduct(slug: string): Promise<ProductDetail | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG, productTag(slug));
  const { data, error } = await createPublicClient().rpc("get_product", { p_slug: slug });
  if (error) throw new CatalogUnavailableError(error);
  return (data as ProductDetail | null) ?? null;
}

export async function getFacets(): Promise<CatalogFacets> {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data, error } = await createPublicClient().rpc("catalog_facets");
  if (error) throw new CatalogUnavailableError(error);
  return data as CatalogFacets;
}

export async function getRelated(product: Pick<ProductDetail, "id" | "family_group" | "gender">) {
  const base = product.family_group ? { familia: product.family_group as CatalogFilters["familia"] } : {};
  const page = await searchCatalog({ ...base, genero: product.gender }, { p_exclude: product.id, p_page_size: 4 });
  if (page.items.length >= 2 || !product.family_group) return page.items;
  return (await searchCatalog({ genero: product.gender }, { p_exclude: product.id, p_page_size: 4 })).items;
}

export async function getCategory(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data } = await createPublicClient().from("categories").select("name, slug, description").eq("slug", slug).maybeSingle();
  return data;
}

export async function getBrand(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CATALOG_TAG);
  const { data } = await createPublicClient().from("brands").select("name, slug").eq("slug", slug).maybeSingle();
  return data;
}

export async function listAllSlugs(): Promise<{ products: string[]; brands: string[]; categories: string[] }> {
  "use cache";
  cacheTag(CATALOG_TAG);
  const client = createPublicClient();
  const [p, b, c] = await Promise.all([
    client.from("products").select("slug"),
    client.from("brands").select("slug"),
    client.from("categories").select("slug"),
  ]);
  if (p.error || b.error || c.error) cacheLife("minutes");
  else cacheLife("hours");
  return {
    products: (p.data ?? []).map((r) => r.slug),
    brands: (b.data ?? []).map((r) => r.slug),
    categories: (c.data ?? []).map((r) => r.slug),
  };
}
