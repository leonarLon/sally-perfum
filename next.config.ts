import type { NextConfig } from "next";
import { assertPaymentConfig, securityHeaders } from "./src/lib/security/headers";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

// Falha o build/start se o pagamento simulado estiver ativo em modo comercial.
assertPaymentConfig({ STORE_MODE: process.env.STORE_MODE, PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER });

const headers = securityHeaders({
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  isDev: process.env.NODE_ENV === "development",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
});

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  experimental: {
    // Upload de imagem do painel: até 5 MB de arquivo + margem do multipart.
    serverActions: { bodySizeLimit: "6mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseHost
        ? [{ protocol: "https" as const, hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      // Fallback da carga inicial (imagens de referência, projeto de estudo) até o upload ao Storage.
      { protocol: "https", hostname: "epocacosmeticos.vteximg.com.br", pathname: "/arquivos/ids/**" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers }];
  },
};

export default nextConfig;
