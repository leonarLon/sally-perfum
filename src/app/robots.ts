import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/minha-conta", "/checkout", "/carrinho", "/pedido", "/buscar", "/api"] }],
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
