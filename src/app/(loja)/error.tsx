"use client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/card";

export default function LojaError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="font-display text-3xl font-semibold">Não foi possível carregar esta página</h1>
      <p className="max-w-md text-muted">Tivemos um problema ao buscar os dados do catálogo. Tente novamente em instantes.</p>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </Container>
  );
}
