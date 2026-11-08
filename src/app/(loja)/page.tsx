import { QrCode, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/card";

const entradas = [
  { href: "/produtos?genero=feminino", titulo: "Feminino", texto: "Florais, gourmands e chipres" },
  { href: "/produtos?genero=masculino", titulo: "Masculino", texto: "Amadeirados, aromáticos e fougères" },
  { href: "/produtos?genero=unissex", titulo: "Unissex", texto: "Cítricos e assinaturas compartilháveis" },
  { href: "/produtos?origem=nacional", titulo: "Nacionais", texto: "Clássicos da perfumaria brasileira" },
];

const vantagens = [
  { icon: QrCode, titulo: "Pix", texto: "Pagamento rápido (simulado neste projeto)" },
  { icon: Truck, titulo: "Entrega", texto: "Frete por região, calculado no carrinho" },
  { icon: ShieldCheck, titulo: "Compra segura", texto: "Seus dados protegidos e sem cadastro obrigatório" },
];

export default function HomePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-secondary/60 to-background">
        <Container className="grid gap-8 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Sally Perfumaria</p>
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Encontre a fragrância que conta a sua história
            </h1>
            <p className="max-w-prose text-lg text-muted">
              Perfumes importados e nacionais com curadoria, notas olfativas detalhadas e
              filtros por família, ocasião e faixa de preço.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/produtos">Ver perfumes</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/produtos?promocao=1">Ver promoções</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section aria-labelledby="explorar">
        <Container className="py-12">
          <h2 id="explorar" className="mb-6 font-display text-3xl font-semibold">
            Explore por estilo
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {entradas.map((e) => (
              <li key={e.href}>
                <Link
                  href={e.href}
                  className="block h-full rounded-card border border-border bg-surface p-6 transition-colors hover:border-primary"
                >
                  <span className="font-display text-2xl font-semibold text-primary">{e.titulo}</span>
                  <span className="mt-2 block text-sm text-muted">{e.texto}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section aria-label="Vantagens" className="border-y border-border">
        <Container className="grid gap-6 py-10 sm:grid-cols-3">
          {vantagens.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="flex items-start gap-3">
              <Icon className="mt-0.5 size-6 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">{titulo}</p>
                <p className="text-sm text-muted">{texto}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>
    </>
  );
}
