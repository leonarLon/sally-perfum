import { Logo } from "@/components/layout/logo";

export const metadata = { title: "Acesso administrativo", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main id="conteudo" className="flex flex-1 items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm rounded-card border border-border bg-background p-8 text-center">
        <Logo href="/" className="text-2xl" />
        <h1 className="mt-6 font-display text-2xl font-semibold">Acesso administrativo</h1>
        <p className="mt-3 text-sm text-muted" role="status">
          O login administrativo será implementado na Fase 5.
        </p>
      </div>
    </main>
  );
}
