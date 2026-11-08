import { Container } from "@/components/ui/card";

/**
 * Marcador explícito de rota planejada e ainda não implementada.
 * Não simula funcionalidade: informa a fase em que ela será entregue.
 */
export function EmConstrucao({ titulo, fase }: { titulo: string; fase: number }) {
  return (
    <Container className="py-16">
      <h1 className="font-display text-3xl font-semibold">{titulo}</h1>
      <p className="mt-3 text-muted" role="status">
        Esta área ainda não foi implementada. Previsão: Fase {fase} do plano (docs/FASE-1-DIAGNOSTICO.md §16).
      </p>
    </Container>
  );
}
