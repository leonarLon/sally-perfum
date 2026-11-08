import Link from "next/link";
import { Container } from "@/components/ui/card";
import { Logo } from "./logo";

const groups = [
  {
    title: "Loja",
    links: [
      { href: "/produtos", label: "Todos os perfumes" },
      { href: "/assistente", label: "Consultor de Fragrâncias" },
      { href: "/carrinho", label: "Sacola" },
    ],
  },
  {
    title: "Minha conta",
    links: [
      { href: "/login", label: "Entrar" },
      { href: "/cadastro", label: "Criar conta" },
      { href: "/minha-conta/pedidos", label: "Meus pedidos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <Container className="grid gap-8 py-12 sm:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Projeto de estudo. Preços, estoques e imagens são apenas para demonstração e não
            representam ofertas reais.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h2 className="mb-3 text-sm font-semibold">{g.title}</h2>
            <ul className="space-y-2 text-sm">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-muted hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
    </footer>
  );
}
