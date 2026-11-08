/**
 * "SDK" do provedor simulado, executado NO NAVEGADOR: valida o cartão de teste e devolve
 * um token. Só o token (resultado + bandeira + 4 últimos dígitos) vai ao servidor; número,
 * validade e CVV nunca saem do navegador. Provedores reais fazem o mesmo (tokenização).
 */
export const TEST_CARDS = {
  "4242424242424242": { outcome: "approve", label: "aprovado" },
  "4000000000000002": { outcome: "decline", label: "recusado" },
  "5555555555554444": { outcome: "approve", label: "aprovado (Mastercard)" },
} as const;

export const CARD_TOKEN_RE = /^tok_fake_(approve|decline)_(visa|mastercard)_(\d{4})$/;

export function luhnValid(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return digits.length >= 13 && sum % 10 === 0;
}

export type TokenizeResult = { token: string } | { error: string; field: "number" | "expiry" | "cvc" };

export function fakeTokenize(number: string, expiry: string, cvc: string, now = new Date()): TokenizeResult {
  const digits = number.replace(/\D/g, "");
  if (!luhnValid(digits)) return { error: "Número de cartão inválido.", field: "number" };
  const test = TEST_CARDS[digits as keyof typeof TEST_CARDS];
  if (!test) return { error: "Use um dos cartões de teste listados (projeto de demonstração).", field: "number" };
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(expiry.trim());
  if (!m || Number(m[1]) < 1 || Number(m[1]) > 12) return { error: "Validade no formato MM/AA.", field: "expiry" };
  const expEnd = new Date(2000 + Number(m[2]), Number(m[1]), 1);
  if (expEnd <= now) return { error: "Cartão vencido.", field: "expiry" };
  if (!/^\d{3,4}$/.test(cvc.trim())) return { error: "CVV com 3 ou 4 dígitos.", field: "cvc" };
  const brand = digits.startsWith("5") ? "mastercard" : "visa";
  return { token: `tok_fake_${test.outcome}_${brand}_${digits.slice(-4)}` };
}
