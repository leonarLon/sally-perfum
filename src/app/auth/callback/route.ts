import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeStoreReturnTo } from "@/lib/auth/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const OTP_TYPES = new Set<EmailOtpType>(["signup", "recovery", "email", "email_change", "invite", "magiclink"]);

/**
 * Destino dos links enviados por e-mail (confirmação de conta e recuperação de senha).
 * Aceita o fluxo PKCE (?code=) e o de token (?token_hash=&type=). O destino final (?next=)
 * só pode ser um caminho interno da loja.
 */
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeStoreReturnTo(url.searchParams.get("next"), "/minha-conta");
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createSupabaseServerClient();

  let ok = false;
  if (code) {
    ok = !(await supabase.auth.exchangeCodeForSession(code)).error;
  } else if (tokenHash && type && OTP_TYPES.has(type)) {
    ok = !(await supabase.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  }

  const target = ok ? next : `/login?erro=link-invalido`;
  return NextResponse.redirect(new URL(target, url.origin));
}
