"use server";
import { redirect } from "next/navigation";
import { z } from "@/lib/zod";
import { safeAdminReturnTo } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const credentials = z.object({
  email: z.email("Informe um e-mail válido.").max(254),
  password: z.string().min(1, "Informe a senha.").max(200),
});

// Mensagem única para credencial errada e conta sem papel: não revela quais e-mails existem.
const GENERIC = "E-mail ou senha incorretos, ou conta sem acesso ao painel.";

export async function signInAdmin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = typeof formData.get("email") === "string" ? String(formData.get("email")).slice(0, 254) : "";
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) return { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo.", email };
    return { error: GENERIC, email };
  }

  const { data: isAdmin } = await supabase.rpc("has_role", { required: "admin" });
  if (isAdmin !== true) {
    await supabase.auth.signOut();
    return { error: GENERIC, email };
  }

  redirect(safeAdminReturnTo(formData.get("returnTo")));
}

export async function signOutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
