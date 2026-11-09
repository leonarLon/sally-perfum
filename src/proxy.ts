import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_OPTIONS } from "@/lib/supabase/cookies";

/**
 * Proxy (antigo middleware no Next 16).
 * 1) Renova a sessão Supabase e regrava os cookies httpOnly.
 * 2) Redireciona visitantes sem sessão de áreas privadas — APENAS UX.
 *    A autorização real (papel admin/owner, dono do recurso) é verificada no
 *    servidor (requireRole/requireUser) e no banco (RLS). Ver SECURITY.md.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookieOptions: SESSION_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet, headers) {
        for (const { name, value } of toSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of toSet) response.cookies.set(name, value, options);
        if (headers) for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });

  // getClaims valida a assinatura do JWT (não confia apenas no cookie).
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const needsLogin =
    (pathname.startsWith("/minha-conta") && !isAuthenticated) ||
    (pathname.startsWith("/admin") && pathname !== "/admin/login" && !isAuthenticated);

  if (needsLogin) {
    const loginPath = pathname.startsWith("/admin") ? "/admin/login" : "/login";
    const redirectUrl = new URL(loginPath, request.url);
    redirectUrl.searchParams.set("returnTo", pathname + search);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Ignora estáticos, imagens otimizadas e webhooks (que validam assinatura própria).
    "/((?!_next/static|_next/image|favicon.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};
