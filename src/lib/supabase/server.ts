import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

/**
 * Cliente por requisição com a sessão do usuário (cookies httpOnly).
 * Sempre crie um novo por render/ação; nunca compartilhe entre requisições.
 */
export async function createSupabaseServerClient() {
  const env = getPublicEnv();
  const cookieStore = await cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) cookieStore.set(name, value, options);
        } catch {
          // Chamado a partir de um Server Component: cookies são somente leitura.
          // O proxy (src/proxy.ts) cuida do refresh da sessão nesse caso.
        }
      },
    },
  });
}
