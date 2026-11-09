/**
 * Cookies da sessão Supabase. O padrão do @supabase/ssr é httpOnly: false (para o cliente
 * de navegador ler a sessão). Esta loja só lê a sessão no servidor, então o cookie fica
 * inacessível a JavaScript: um XSS não consegue roubar o token. `secure` em HTTPS.
 */
export const SESSION_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  httpOnly: true,
  secure: (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://"),
};
