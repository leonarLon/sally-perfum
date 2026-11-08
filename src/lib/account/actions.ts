"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { fieldErrors, formToObject, type FormState } from "@/lib/admin/schemas";
import { getSessionUser } from "@/lib/auth/session";
import { getPublicEnv } from "@/lib/env";
import { ADDRESS_FIELDS, addressSchema, newPasswordSchema, profileSchema } from "@/lib/auth/schemas";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Ações da área do cliente. Todas exigem sessão e escrevem com o cliente da sessão,
 * de modo que a RLS garante que cada pessoa só altera os próprios dados.
 * Exceção: exclusão de conta, que precisa do service role para remover o usuário do Auth.
 */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPIRED: FormState = { message: "Sua sessão expirou. Entre de novo." };

async function session() {
  const user = await getSessionUser();
  return user ? { user, supabase: await createSupabaseServerClient() } : null;
}

export async function saveProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await session();
  if (!s) return EXPIRED;
  const parsed = profileSchema.safeParse(formToObject(formData, ["full_name", "phone"]));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  // Sem upsert: o privilégio de UPDATE não inclui user_id.
  const { data, error } = await s.supabase.from("profiles").update(parsed.data).eq("user_id", s.user.id).select("user_id");
  const result = !error && !data?.length ? await s.supabase.from("profiles").insert({ user_id: s.user.id, ...parsed.data }) : { error };
  if (result.error) return { message: "Não foi possível salvar. Tente de novo." };
  refresh();
  return { ok: true, message: "Dados salvos." };
}

export async function saveAddress(addressId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  if (addressId && !UUID_RE.test(addressId)) return { message: "Endereço inválido." };
  const s = await session();
  if (!s) return EXPIRED;
  const parsed = addressSchema.safeParse(formToObject(formData, ADDRESS_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  if (addressId) {
    const { error } = await s.supabase.from("customer_addresses").update(parsed.data).eq("id", addressId);
    if (error) return { message: "Não foi possível salvar o endereço." };
  } else {
    const { count } = await s.supabase.from("customer_addresses").select("id", { count: "exact", head: true });
    const { error } = await s.supabase.from("customer_addresses").insert({ ...parsed.data, is_default: !count });
    if (error) return { message: /limite/.test(error.message) ? "Você já tem 10 endereços. Remova um para adicionar outro." : "Não foi possível salvar o endereço." };
  }
  refresh();
  return { ok: true, message: addressId ? "Endereço atualizado." : "Endereço adicionado." };
}

export async function deleteAddress(addressId: string): Promise<FormState> {
  if (!UUID_RE.test(addressId)) return { message: "Endereço inválido." };
  const s = await session();
  if (!s) return EXPIRED;
  const { data: removed } = await s.supabase.from("customer_addresses").delete().eq("id", addressId).select("is_default");
  if (removed?.[0]?.is_default) {
    const { data: next } = await s.supabase.from("customer_addresses").select("id").order("created_at").limit(1).maybeSingle();
    if (next) await s.supabase.rpc("set_default_address", { p_address_id: next.id });
  }
  refresh();
  return { ok: true, message: "Endereço removido." };
}

export async function setDefaultAddress(addressId: string): Promise<FormState> {
  if (!UUID_RE.test(addressId)) return { message: "Endereço inválido." };
  const s = await session();
  if (!s) return EXPIRED;
  const { error } = await s.supabase.rpc("set_default_address", { p_address_id: addressId });
  if (error) return { message: "Não foi possível definir o endereço padrão." };
  refresh();
  return { ok: true, message: "Endereço padrão atualizado." };
}

export type FavoriteState = { loggedIn: boolean; favorite: boolean };

export async function getFavoriteState(productId: string): Promise<FavoriteState> {
  if (!UUID_RE.test(productId)) return { loggedIn: false, favorite: false };
  const s = await session();
  if (!s) return { loggedIn: false, favorite: false };
  const { data } = await s.supabase.from("favorites").select("product_id").eq("product_id", productId).maybeSingle();
  return { loggedIn: true, favorite: Boolean(data) };
}

export async function toggleFavorite(productId: string): Promise<FavoriteState & { error?: string }> {
  if (!UUID_RE.test(productId)) return { loggedIn: false, favorite: false };
  const s = await session();
  if (!s) return { loggedIn: false, favorite: false };
  const current = await s.supabase.from("favorites").select("product_id").eq("product_id", productId).maybeSingle();
  if (current.data) {
    await s.supabase.from("favorites").delete().eq("product_id", productId);
    return { loggedIn: true, favorite: false };
  }
  const { error } = await s.supabase.from("favorites").insert({ product_id: productId });
  if (error && error.code !== "23505") return { loggedIn: true, favorite: false, error: "Não foi possível favoritar agora." };
  return { loggedIn: true, favorite: true };
}

/** Confere a senha atual sem trocar a sessão do navegador (cliente isolado, sem cookies). */
async function passwordMatches(email: string, password: string) {
  const { createClient } = await import("@supabase/supabase-js");
  const env = getPublicEnv();
  const probe = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error } = await probe.auth.signInWithPassword({ email, password });
  if (!error) await probe.auth.signOut({ scope: "local" });
  return !error;
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await session();
  if (!s || !s.user.email) return EXPIRED;
  const current = String(formData.get("current_password") ?? "");
  const parsed = newPasswordSchema.safeParse(formToObject(formData, ["password", "password_confirm"]));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (!rateLimit(`pwd:${s.user.id}`, 5, 15 * 60_000).ok) return { message: "Muitas tentativas. Aguarde alguns minutos." };
  if (!(await passwordMatches(s.user.email, current))) return { fieldErrors: { current_password: "Senha atual incorreta." } };
  const { error } = await s.supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { message: error.code === "same_password" ? "Use uma senha diferente da atual." : "Não foi possível trocar a senha." };
  return { ok: true, message: "Senha alterada." };
}

/**
 * Exclusão de conta (LGPD, art. 18, VI). Exige digitar EXCLUIR e a senha atual.
 * Apaga perfil, endereços e favoritos (cascade). Pedidos já feitos são mantidos sem o
 * vínculo com a conta, para cumprir obrigações legais e fiscais (art. 16, I).
 */
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const s = await session();
  if (!s || !s.user.email) return EXPIRED;
  if (String(formData.get("confirm") ?? "").trim().toUpperCase() !== "EXCLUIR") return { fieldErrors: { confirm: "Digite EXCLUIR para confirmar." } };
  if (!rateLimit(`delete:${s.user.id}:${clientIp(await headers())}`, 5, 15 * 60_000).ok) return { message: "Muitas tentativas. Aguarde alguns minutos." };
  if (!(await passwordMatches(s.user.email, String(formData.get("password") ?? "")))) return { fieldErrors: { password: "Senha incorreta." } };

  const { data: roles } = await s.supabase.from("user_roles").select("role");
  if (roles?.length) return { message: "Contas de administração não podem ser excluídas por aqui." };

  const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(s.user.id);
  if (error) return { message: "Não foi possível excluir a conta agora. Tente de novo." };
  await s.supabase.auth.signOut();
  redirect("/?conta=excluida");
}
