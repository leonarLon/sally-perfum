/**
 * Valores monetários são SEMPRE inteiros em centavos (ex.: R$ 189,90 = 18990).
 * Nunca use ponto flutuante para somar, multiplicar ou aplicar descontos.
 */
export type Cents = number;

export function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new TypeError(`Valor monetário inválido (esperado inteiro em centavos): ${value}`);
  }
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Formata centavos como moeda brasileira. Usa espaço não separável, como o Intl. */
export function formatBRL(cents: Cents): string {
  assertCents(cents);
  return brl.format(cents / 100);
}

/** Converte texto digitado ("189,90", "1.299,00", "R$ 50") para centavos sem float. */
export function parseBRLToCents(input: string): Cents {
  const cleaned = input.replace(/[R$\s]/g, "").replace(/\./g, "");
  const match = /^(\d+)(?:,(\d{1,2}))?$/.exec(cleaned);
  if (!match) throw new TypeError(`Valor inválido: "${input}"`);
  const reais = Number(match[1]);
  const centavos = Number((match[2] ?? "0").padEnd(2, "0"));
  const cents = reais * 100 + centavos;
  assertCents(cents);
  return cents;
}

export function multiplyCents(unit: Cents, qty: number): Cents {
  assertCents(unit);
  if (!Number.isSafeInteger(qty) || qty < 0) throw new TypeError(`Quantidade inválida: ${qty}`);
  return unit * qty;
}

export function sumCents(values: Cents[]): Cents {
  return values.reduce((acc, v) => {
    assertCents(v);
    return acc + v;
  }, 0);
}

/**
 * Aplica percentual expresso em pontos-base (1% = 100 bps) com arredondamento
 * "half up" sobre inteiros, ex.: 10% de R$ 189,90 => 1899.
 */
export function percentOf(cents: Cents, basisPoints: number): Cents {
  assertCents(cents);
  if (!Number.isSafeInteger(basisPoints) || basisPoints < 0 || basisPoints > 10_000) {
    throw new TypeError(`Percentual inválido: ${basisPoints}`);
  }
  return Math.floor((cents * basisPoints + 5_000) / 10_000);
}

/** Percentual de desconto inteiro para selos "-40%". */
export function discountPercent(original: Cents, current: Cents): number {
  assertCents(original);
  assertCents(current);
  if (original <= 0 || current >= original) return 0;
  return Math.round(((original - current) * 100) / original);
}

/**
 * Divide um total em N parcelas sem juros. A diferença de arredondamento fica na
 * primeira parcela, de modo que a soma das parcelas é exatamente o total.
 */
export function splitInstallments(total: Cents, count: number): Cents[] {
  assertCents(total);
  if (!Number.isSafeInteger(count) || count < 1) throw new TypeError(`Parcelas inválidas: ${count}`);
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, i) => (i === 0 ? base + remainder : base));
}

/** Maior número de parcelas respeitando um valor mínimo por parcela. */
export function maxInstallments(total: Cents, minInstallment: Cents, cap = 10): number {
  assertCents(total);
  assertCents(minInstallment);
  if (minInstallment <= 0) return cap;
  return Math.max(1, Math.min(cap, Math.floor(total / minInstallment)));
}
