import { Heart, Search, ShoppingBag, Sparkles, User } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/card";
import { Logo } from "./logo";

/** Navegação principal. As categorias reais vêm do banco a partir da Fase 3; aqui são filtros de URL estáveis. */
export const mainNav = [
  { href: "/produtos?genero=feminino", label: "Feminino" },
  { href: "/produtos?genero=masculino", label: "Masculino" },
  { href: "/produtos?genero=unissex", label: "Unissex" },
  { href: "/produtos?origem=nacional", label: "Nacionais" },
  { href: "/produtos?promocao=1", label: "Promoções" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground">
        Projeto de estudo — loja de demonstração, sem vendas reais.
      </div>
      <Container className="flex h-16 items-center gap-4">
        <Logo />
        <form action="/buscar" role="search" className="ml-auto hidden max-w-md flex-1 md:flex">
          <label htmlFor="busca" className="sr-only">
            Buscar perfumes
          </label>
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              id="busca"
              name="q"
              type="search"
              placeholder="Buscar por perfume, marca ou nota"
              className="h-10 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-sm placeholder:text-muted focus-visible:border-primary"
            />
          </div>
        </form>
        <nav aria-label="Atalhos da conta" className="ml-auto flex items-center gap-1 md:ml-0">
          <HeaderIcon href="/assistente" label="Consultor de Fragrâncias" icon={<Sparkles />} />
          <HeaderIcon href="/minha-conta/favoritos" label="Favoritos" icon={<Heart />} />
          <HeaderIcon href="/minha-conta" label="Minha conta" icon={<User />} />
          <HeaderIcon href="/carrinho" label="Sacola" icon={<ShoppingBag />} />
        </nav>
      </Container>
      <Container>
        <nav aria-label="Categorias" className="flex gap-6 overflow-x-auto pb-3 text-sm">
          {mainNav.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap text-muted hover:text-primary">
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </header>
  );
}

function HeaderIcon({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex size-10 items-center justify-center rounded-full text-text hover:bg-surface hover:text-primary [&_svg]:size-5"
    >
      {icon}
    </Link>
  );
}
