import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";
import { getServerEnv } from "@/lib/env.server";

/**
 * Cliente com service role: IGNORA a RLS. Use somente em código de servidor que já
 * validou autorização (requireRole) ou em processos confiáveis (webhooks validados,
 * seed). Nunca exponha o resultado bruto ao cliente.
 */
export function createSupabaseAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL } = getPublicEnv();
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  return createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
