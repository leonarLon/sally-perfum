import { Container } from "@/components/ui/card";

/**
 * Marcador explícito de área do painel que não faz parte desta versão.
 * Não simula funcionalidade: diz o que existe e onde está registrado o que falta.
 */
export function EmConstrucao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <Container className="py-16">
      <h1 className="font-display text-3xl font-semibold">{titulo}</h1>
      <p className="mt-3 text-muted" role="status">
        Esta área não faz parte da versão de demonstração. {descricao}
      </p>
    </Container>
  );
}
