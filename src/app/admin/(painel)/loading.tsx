import { Skeleton } from "@/components/ui/card";

/** Carregamento de cada página do painel: o layout (menu e cabeçalho) continua visível. */
export default function Loading() {
  return (
    <div role="status" aria-label="Carregando" className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-11 w-full max-w-xl" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
