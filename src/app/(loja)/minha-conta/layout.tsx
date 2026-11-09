import { LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "@/components/account/account-nav";
import { Container, Skeleton } from "@/components/ui/card";
import { signOut } from "@/lib/auth/actions";
import { requireUser, sessionHasRole } from "@/lib/auth/session";

export const metadata = { title: { default: "Minha conta", template: "%s | Minha conta" }, robots: { index: false } };

/** O proxy só redireciona quem não tem sessão (UX); aqui a sessão é validada no servidor. */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="grid gap-8 py-10 md:grid-cols-[14rem_1fr]">
      <aside className="space-y-4">
        <AccountNav />
        <form action={signOut}>
          <button type="submit" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-text">
            <LogOut className="size-4" aria-hidden /> Sair
          </button>
        </form>
      </aside>
      <Suspense fallback={<div role="status" aria-label="Carregando" className="space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-40 w-full" /></div>}>
        <AccountGate>{children}</AccountGate>
      </Suspense>
    </Container>
  );
}

async function AccountGate({ children }: { children: React.ReactNode }) {
  await requireUser("/minha-conta");
  const isAdmin = await sessionHasRole("admin");
  return (
    <div className="min-w-0 space-y-6">
      {isAdmin && (
        <aside aria-label="Painel da loja" className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-primary/40 bg-secondary/40 p-4">
          <p className="text-sm">
            Você é administrador desta loja. Produtos, estoque, pedidos e cupons ficam no painel.
          </p>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            <LayoutDashboard className="size-4" aria-hidden /> Abrir o painel da loja
          </Link>
        </aside>
      )}
      {children}
    </div>
  );
}
