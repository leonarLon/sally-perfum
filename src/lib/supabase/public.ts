import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

/**
 * Cliente anônimo SEM cookies. Usado para leituras públicas do catálogo dentro de
 * funções `'use cache'` (que não podem acessar cookies). A RLS garante que só
 * produtos publicados sejam visíveis para o papel `anon`.
 */
export function createPublicClient() {
  const env = getPublicEnv();
  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
