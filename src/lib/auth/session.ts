import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "admin" | "owner";
export type SessionUser = { id: string; email: string | null };

/**
 * Camada de acesso (DAL): toda página e ação privada passa por aqui.
 * getClaims() valida a assinatura do JWT; o papel vem do banco (has_role),
 * nunca de dado enviado pelo navegador. Deduplicado por requisição com cache().
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) return null;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;
  return { id: sub, email };
});

const hasRole = cache(async (role: Role): Promise<boolean> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("has_role", { required: role });
  return !error && data === true;
});

export async function requireUser(returnTo = "/minha-conta") {
  const user = await getSessionUser();
  if (!user) redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  return user;
}

/**
 * Exige papel admin (owner inclui admin). Sem sessão → login; com sessão sem papel →
 * login com aviso. Devolve o cliente com a sessão do usuário: as escritas continuam
 * sujeitas à RLS (defesa em profundidade), sem service role.
 */
export async function requireRole(role: Role = "admin") {
  const user = await getSessionUser();
  if (!user) redirect("/admin/login");
  if (!(await hasRole(role))) redirect("/admin/login?erro=sem-permissao");
  return { user, supabase: await createSupabaseServerClient() };
}

/** Aceita só caminhos internos do painel (evita open redirect via ?returnTo=). */
export function safeAdminReturnTo(value: unknown): string {
  if (typeof value !== "string") return "/admin";
  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) return "/admin";
  if (/[\\\r\n]/.test(value) || value.includes("//")) return "/admin";
  return value;
}
