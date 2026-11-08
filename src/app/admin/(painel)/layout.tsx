import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Logo } from "@/components/layout/logo";

export const metadata = { title: { default: "Admin", template: "%s | Admin Sally" }, robots: { index: false } };

/**
 * Layout do painel. O proxy só redireciona quem não tem sessão (UX).
 * A verificação de papel (admin/owner) no servidor + RLS entra na Fase 5,
 * junto com as primeiras operações administrativas reais.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface md:block">
        <div className="flex h-16 items-center px-6">
          <Logo href="/admin" className="text-xl" />
        </div>
        <AdminSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-6">
          <span className="text-sm font-medium text-muted">Painel administrativo</span>
          <Link href="/" className="text-sm text-primary hover:underline">
            Ver loja
          </Link>
        </header>
        <main id="conteudo" className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
