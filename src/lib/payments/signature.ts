import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Assinatura dos webhooks no formato "t=<unix>,v1=<hex>", com HMAC-SHA256 sobre
 * "<t>.<corpo bruto>". Mesmo padrão de provedores reais: impede forjar eventos e,
 * com a tolerância de tempo, reaproveitar um evento antigo capturado.
 */
export const SIGNATURE_HEADER = "x-sally-signature";
export const SIGNATURE_TOLERANCE_SECONDS = 300;

export function signPayload(body: string, secret: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${v1}`;
}

export type VerifyResult = { ok: true } | { ok: false; reason: "missing" | "malformed" | "expired" | "mismatch" };

export function verifySignature(
  body: string,
  header: string | null,
  secret: string,
  now = Math.floor(Date.now() / 1000),
  tolerance = SIGNATURE_TOLERANCE_SECONDS,
): VerifyResult {
  if (!header) return { ok: false, reason: "missing" };
  const parts = Object.fromEntries(header.split(",").map((p) => p.trim().split("=", 2) as [string, string]));
  const t = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isInteger(t) || !v1 || !/^[0-9a-f]{64}$/.test(v1)) return { ok: false, reason: "malformed" };
  if (Math.abs(now - t) > tolerance) return { ok: false, reason: "expired" };
  const expected = Buffer.from(createHmac("sha256", secret).update(`${t}.${body}`).digest("hex"), "hex");
  const given = Buffer.from(v1, "hex");
  return expected.length === given.length && timingSafeEqual(expected, given) ? { ok: true } : { ok: false, reason: "mismatch" };
}
