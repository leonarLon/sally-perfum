import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="conteudo" className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
      <Logo />
      <h1 className="font-display text-4xl font-semibold">Página não encontrada</h1>
      <p className="text-muted">O endereço pode ter mudado ou o produto não está mais disponível.</p>
      <Button asChild>
        <Link href="/produtos">Ver perfumes</Link>
      </Button>
    </main>
  );
}
