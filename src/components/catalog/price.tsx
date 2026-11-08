import { discountPercent, formatBRL, maxInstallments, splitInstallments, type Cents } from "@/lib/money";
import { cn } from "@/lib/utils";

/** Regra de parcelamento de demonstração: até 10x sem juros, parcela mínima R$ 50. */
export const INSTALLMENT_MIN_CENTS = 5000;
export const INSTALLMENT_CAP = 10;

export function installmentText(total: Cents) {
  const n = maxInstallments(total, INSTALLMENT_MIN_CENTS, INSTALLMENT_CAP);
  if (n < 2) return null;
  const parts = splitInstallments(total, n);
  return `ou ${n}x de ${formatBRL(parts[parts.length - 1])} sem juros`;
}

export function Price({
  price,
  compareAt,
  fromPrice = false,
  size = "md",
  className,
}: {
  price: Cents;
  compareAt?: Cents | null;
  fromPrice?: boolean;
  size?: "md" | "lg";
  className?: string;
}) {
  const off = compareAt ? discountPercent(compareAt, price) : 0;
  const installments = installmentText(price);
  return (
    <div className={cn("space-y-0.5", className)}>
      {compareAt && off > 0 ? (
        <p className="text-xs text-muted">
          <span className="sr-only">Preço original: </span>
          <s>{formatBRL(compareAt)}</s>
          <span className="ml-2 font-semibold text-primary">-{off}%</span>
        </p>
      ) : null}
      <p className={cn("font-semibold text-text", size === "lg" ? "text-3xl" : "text-lg")}>
        {fromPrice ? <span className="mr-1 text-xs font-normal text-muted">a partir de</span> : null}
        <span className="sr-only">Preço: </span>
        {formatBRL(price)}
      </p>
      {installments ? <p className="text-xs text-muted">{installments}</p> : null}
    </div>
  );
}
