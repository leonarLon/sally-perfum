import "server-only";
import { z } from "@/lib/zod";
import { MissingConfigError } from "./env";
import { assertPaymentConfig } from "./security/headers";

/** Segredos: nunca importar este módulo em Client Components ("server-only" garante erro de build). */
const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
});

export function getServerEnv() {
  const parsed = serverSchema.safeParse({
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
  if (!parsed.success) {
    throw new MissingConfigError(parsed.error.issues.map((i) => i.path.join(".")).join(", "));
  }
  return parsed.data;
}


const paymentSchema = z.object({
  PAYMENT_PROVIDER: z.enum(["fake"]).default("fake"),
  PAYMENT_WEBHOOK_SECRET: z.string().min(32, "PAYMENT_WEBHOOK_SECRET precisa de 32+ caracteres"),
});

/** Configuração de pagamentos. Só o provedor simulado é aceito neste projeto de estudo. */
export function getPaymentEnv() {
  assertPaymentConfig({ STORE_MODE: process.env.STORE_MODE, PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER });
  const parsed = paymentSchema.safeParse({
    PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || undefined,
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
  });
  if (!parsed.success) {
    throw new MissingConfigError(parsed.error.issues.map((i) => i.path.join(".")).join(", "));
  }
  return parsed.data;
}
