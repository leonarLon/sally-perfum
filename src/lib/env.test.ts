import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicEnv, isSupabaseConfigured, MissingConfigError } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("env", () => {
  it("falha com mensagem clara quando o Supabase não está configurado", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    expect(isSupabaseConfigured()).toBe(false);
    expect(() => getPublicEnv()).toThrow(MissingConfigError);
  });

  it("aceita configuração válida", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://abc.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "x".repeat(40));
    expect(isSupabaseConfigured()).toBe(true);
    expect(getPublicEnv().NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
  });
});
