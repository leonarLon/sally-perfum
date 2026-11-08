import { Suspense } from "react";
import { Logo } from "@/components/layout/logo";
import { AdminLoginForm, AdminLoginFormWithParams } from "./login-form";

export const metadata = { title: "Acesso administrativo", robots: { index: false } };

/** Página estática (sem leitura de dados no servidor): ver o comentário em login-form.tsx. */
export default function AdminLoginPage() {
  return (
    <main id="conteudo" className="flex flex-1 items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-background p-8">
        <div className="text-center">
          <Logo href="/" className="text-2xl" />
          <h1 className="mt-6 font-display text-2xl font-semibold">Acesso administrativo</h1>
          <p className="mt-2 text-sm text-muted">Somente contas com papel de administrador.</p>
        </div>
        <Suspense fallback={<AdminLoginForm />}>
          <AdminLoginFormWithParams />
        </Suspense>
      </div>
    </main>
  );
}
