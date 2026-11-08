import { LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { Logo } from "@/components/layout/logo";
import { Skeleton } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/session";
import { signOutAdmin } from "../login/actions";

export const metadata = { title: { default: "Admin", template: "%s | Admin Sally" }, robots: { index: false } };

/**
 * Layout do painel. O proxy só redireciona quem não tem sessão (UX); aqui o papel é
 * verificado no servidor antes de qualquer conteúdo, e cada página/ação repete a
 * verificação (requireRole) — além da RLS no banco.
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
      <Suspense fallback={<PainelCarregando />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </div>
  );
}

async function AdminGate({ children }: { children: React.ReactNode }) {
  const { user } = await requireRole("admin");
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 items-center justify-between gap-4 border-b border-border px-6">
        <span className="truncate text-sm text-muted">
          Painel administrativo{user.email ? ` · ${user.email}` : ""}
        </span>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-primary hover:underline">
            Ver loja
          </Link>
          <form action={signOutAdmin}>
            <button type="submit" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text">
              <LogOut className="size-4" aria-hidden /> Sair
            </button>
          </form>
        </div>
      </header>
      <main id="conteudo" className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

function PainelCarregando() {
  return (
    <div className="flex min-w-0 flex-1 flex-col" role="status" aria-label="Verificando acesso">
      <div className="h-16 border-b border-border" />
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  );
}
