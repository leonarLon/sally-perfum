import { Skeleton } from "@/components/ui/card";

/** Carregamento de cada página da conta: o menu lateral continua visível. */
export default function Loading() {
  return (
    <div role="status" aria-label="Carregando" className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
