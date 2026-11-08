import "server-only";
import { z } from "zod";
import { MissingConfigError } from "./env";

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

