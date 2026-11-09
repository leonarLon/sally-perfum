/**
 * Cabeçalhos de segurança, montados em next.config.ts (sem dependências do app).
 *
 * CSP sem nonce: com Cache Components (pré-renderização parcial) a CSP com nonce é
 * incompatível (guia oficial do Next, "Without Nonces"), e o Next injeta scripts inline
 * com o payload RSC. Por isso script-src aceita 'unsafe-inline'. O restante fica fechado:
 * nada de plugins, <base>, iframes de terceiros, formulários externos, nem conexões ou
 * imagens fora da própria loja e do Supabase.
 */
export function buildCsp(opts: { supabaseUrl?: string; isDev: boolean; https: boolean }): string {
  const supabase = opts.supabaseUrl ? new URL(opts.supabaseUrl).origin : "";
  const supabaseWs = supabase.replace(/^https:/, "wss:");
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(opts.isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", supabase, "https://epocacosmeticos.vteximg.com.br"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", supabase, supabaseWs],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "manifest-src": ["'self'"],
    "worker-src": ["'self'", "blob:"],
  };
  const csp = Object.entries(directives)
    .map(([k, v]) => `${k} ${v.filter(Boolean).join(" ")}`)
    .join("; ");
  return opts.https ? `${csp}; upgrade-insecure-requests` : csp;
}

export function securityHeaders(opts: { supabaseUrl?: string; isDev: boolean; siteUrl?: string }) {
  const https = (opts.siteUrl ?? "").startsWith("https://");
  return [
    { key: "Content-Security-Policy", value: buildCsp({ ...opts, https }) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
    ...(https ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }] : []),
  ];
}

/**
 * Trava: em modo comercial (STORE_MODE=commercial) o provedor de pagamento simulado é
 * proibido. Chamada no carregamento do next.config (build e start falham) e no servidor.
 */
export function assertPaymentConfig(env: { STORE_MODE?: string; PAYMENT_PROVIDER?: string }) {
  const provider = env.PAYMENT_PROVIDER || "fake";
  if (env.STORE_MODE === "commercial" && provider === "fake") {
    throw new Error(
      "STORE_MODE=commercial com PAYMENT_PROVIDER=fake: o pagamento simulado não pode rodar numa loja real. Configure um provedor real (PENDENCIAS_COMERCIAIS.md §3).",
    );
  }
}
