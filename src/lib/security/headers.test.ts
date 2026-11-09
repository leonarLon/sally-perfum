import { describe, expect, it } from "vitest";
import { assertPaymentConfig, buildCsp, securityHeaders } from "./headers";

describe("cabeçalhos de segurança", () => {
  it("CSP fecha plugins, <base>, iframes e formulários externos e limita conexões ao Supabase", () => {
    const csp = buildCsp({ supabaseUrl: "https://abc.supabase.co", isDev: false, https: true });
    for (const d of ["object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "frame-src 'none'", "upgrade-insecure-requests"]) {
      expect(csp).toContain(d);
    }
    expect(csp).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
    expect(csp).not.toContain("unsafe-eval"); // só em desenvolvimento
    expect(buildCsp({ isDev: true, https: false })).toContain("'unsafe-eval'");
  });

  it("HSTS e upgrade de requisições só com site em HTTPS", () => {
    const local = securityHeaders({ isDev: false, siteUrl: "http://localhost:3000" });
    expect(local.find((h) => h.key === "Strict-Transport-Security")).toBeUndefined();
    const prod = securityHeaders({ isDev: false, siteUrl: "https://sally.example" });
    expect(prod.find((h) => h.key === "Strict-Transport-Security")?.value).toMatch(/max-age=\d+/);
  });

  it("trava: pagamento simulado proibido em modo comercial", () => {
    expect(() => assertPaymentConfig({ STORE_MODE: "commercial", PAYMENT_PROVIDER: "fake" })).toThrow(/simulado/);
    expect(() => assertPaymentConfig({ STORE_MODE: "commercial" })).toThrow(/simulado/);
    expect(() => assertPaymentConfig({ PAYMENT_PROVIDER: "fake" })).not.toThrow();
  });
});
