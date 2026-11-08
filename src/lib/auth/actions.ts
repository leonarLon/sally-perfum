"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { fieldErrors, formToObject } from "@/lib/admin/schemas";
import { getSessionUser } from "@/lib/auth/session";
import { getSiteUrl } from "@/lib/env";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, newPasswordSchema, resetRequestSchema, safeStoreReturnTo, signupSchema } from "./schemas";

export type AuthState = { ok?: boolean; message?: string; fieldErrors?: Record<string, string>; email?: string };

const TOO_MANY = "Muitas tentativas. Aguarde alguns minutos e tente de novo.";

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = formToObject(formData, ["email", "password"]);
  const parsed = loginSchema.safeParse(raw);
  const email = (raw.email ?? "").slice(0, 254);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), email };

  const ip = clientIp(await headers());
  if (!rateLimit(`login:${ip}`, 20, 10 * 60_000).ok || !rateLimit(`login:${parsed.data.email}`, 8, 10 * 60_000).ok) return { message: TOO_MANY, email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return { message: "Confirme seu e-mail pelo link que enviamos antes de entrar.", email };
    if (error.status === 429) return { message: TOO_MANY, email };
    return { message: "E-mail ou senha incorretos.", email };
  }
  redirect(safeStoreReturnTo(formData.get("returnTo")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const raw = formToObject(formData, ["full_name", "email", "password", "password_confirm", "privacy"]);
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados.", email: raw.email };
  if (!rateLimit(`signup:${clientIp(await headers())}`, 5, 60 * 60_000).ok) return { message: TOO_MANY };

  const { full_name, email, password } = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name }, emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/minha-conta` },
  });
  if (error) {
    if (error.status === 429) return { message: TOO_MANY };
    if (error.code === "weak_password") return { fieldErrors: { password: "Senha fraca. Use uma senha mais longa e variada." } };
    // Mesma resposta para e-mail já cadastrado e outros erros: não revela quem tem conta.
    return { message: "Não foi possível criar a conta. Se você já tem cadastro, entre ou recupere a senha." };
  }

  if (data.session && data.user) {
    await supabase.from("profiles").insert({ user_id: data.user.id, full_name });
    redirect(safeStoreReturnTo(formData.get("returnTo")));
  }
  return { ok: true, message: `Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar a conta.` };
}

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetRequestSchema.safeParse(formToObject(formData, ["email"]));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const ip = clientIp(await headers());
  // Resposta idêntica com ou sem conta, e mesmo quando o limite é atingido (sem enumeração).
  const generic: AuthState = { ok: true, message: "Se houver uma conta com esse e-mail, você vai receber um link para criar uma nova senha." };
  if (!rateLimit(`reset:${ip}`, 10, 60 * 60_000).ok || !rateLimit(`reset:${parsed.data.email}`, 3, 60 * 60_000).ok) return generic;

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, { redirectTo: `${getSiteUrl()}/auth/callback?next=/redefinir-senha` });
  return generic;
}

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const user = await getSessionUser();
  if (!user) return { message: "O link expirou. Peça um novo em “Esqueci minha senha”." };
  const parsed = newPasswordSchema.safeParse(formToObject(formData, ["password", "password_confirm"]));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { fieldErrors: { password: "Use uma senha diferente da atual." } };
    return { message: "Não foi possível trocar a senha. Tente de novo." };
  }
  redirect("/minha-conta?senha=alterada");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
