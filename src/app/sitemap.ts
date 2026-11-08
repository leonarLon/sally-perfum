import type { MetadataRoute } from "next";
import { listAllSlugs } from "@/lib/catalog/queries";
import { getSiteUrl } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const fixed: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/produtos`, changeFrequency: "daily", priority: 0.9 },
  ];
  try {
    const { products, brands, categories } = await listAllSlugs();
    return [
      ...fixed,
      ...categories.map((s) => ({ url: `${base}/categorias/${s}`, changeFrequency: "weekly" as const, priority: 0.7 })),
      ...brands.map((s) => ({ url: `${base}/marcas/${s}`, changeFrequency: "weekly" as const, priority: 0.6 })),
      ...products.map((s) => ({ url: `${base}/produtos/${s}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ];
  } catch {
    return fixed;
  }
}
