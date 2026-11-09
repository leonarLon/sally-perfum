import { z } from "@/lib/zod";

/**
 * Variáveis públicas (seguras para o bundle do navegador).
 * NEXT_PUBLIC_* precisam ser referenciadas literalmente para o Next inlinar.
 */
const publicSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
});

export type PublicEnv = z.infer<typeof publicSchema>;

export class MissingConfigError extends Error {
  constructor(detail: string) {
    super(`Configuração ausente ou inválida: ${detail}. Veja .env.example e README.md.`);
    this.name = "MissingConfigError";
  }
}

export function getPublicEnv(): PublicEnv {
  const parsed = publicSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  });
  if (!parsed.success) {
    throw new MissingConfigError(parsed.error.issues.map((i) => i.path.join(".")).join(", "));
  }
  return parsed.data;
}

/** true quando o Supabase está configurado; usado para degradar com mensagem clara. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
