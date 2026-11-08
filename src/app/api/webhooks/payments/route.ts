import { NextResponse, type NextRequest } from "next/server";
import { handlePaymentWebhook } from "@/lib/payments/webhook";
import { SIGNATURE_HEADER } from "@/lib/payments/signature";
import { clientIp, rateLimit } from "@/lib/rate-limit";

/**
 * Webhook do provedor de pagamento. Não usa sessão nem cookies (o proxy ignora esta rota):
 * a autenticidade vem da assinatura HMAC sobre o corpo bruto.
 */
export async function POST(request: NextRequest) {
  if (!rateLimit(`webhook:${clientIp(request.headers)}`, 120, 60_000).ok) {
    return NextResponse.json({ ok: false, error: "muitas requisições" }, { status: 429 });
  }
  const raw = await request.text();
  if (raw.length > 16_384) return NextResponse.json({ ok: false, error: "corpo grande demais" }, { status: 413 });
  const outcome = await handlePaymentWebhook(raw, request.headers.get(SIGNATURE_HEADER));
  return NextResponse.json(outcome.body, { status: outcome.status });
}
