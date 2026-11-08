import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { AdminLoginForm } from "./login-form";

export const metadata = { title: "Acesso administrativo", robots: { index: false } };

export default function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main id="conteudo" className="flex flex-1 items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-background p-8">
        <div className="text-center">
          <Logo href="/" className="text-2xl" />
          <h1 className="mt-6 font-display text-2xl font-semibold">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-muted">Somente contas com papel de administrador.</p>
        </div>
        <Suspense fallback={<AdminLoginForm />}>
          <LoginWithParams searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function LoginWithParams({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const sp = await searchParams;
  const returnTo = typeof sp.returnTo === "string" ? sp.returnTo : undefined;
  return (
    <>
      {sp.erro === "sem-permissao" && (
        <p role="alert" className="mt-4 rounded-card bg-secondary p-3 text-sm text-secondary-foreground">
          Sua conta não tem acesso ao painel. Entre com uma conta de administrador.
        </p>
      )}
      <AdminLoginForm returnTo={returnTo} />
    </>
  );
}
