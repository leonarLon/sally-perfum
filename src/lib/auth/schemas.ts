import { z } from "zod";
import { UFS } from "@/lib/checkout/schemas";

const email = z.string("Informe um e-mail válido.").trim().toLowerCase().pipe(z.email("Informe um e-mail válido.").max(254));
// bcrypt do Supabase considera até 72 bytes; mínimo 8 com letra e número.
const newPassword = z
  .string("Crie uma senha.")
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .max(72, "Máximo de 72 caracteres.")
  .refine((v) => /[A-Za-z]/.test(v) && /\d/.test(v), "Use letras e números na senha.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe a senha.").max(200),
});

export const signupSchema = z
  .object({
    full_name: z.string("Informe seu nome.").trim().min(2, "Informe seu nome.").max(120),
    email,
    password: newPassword,
    password_confirm: z.string(),
    privacy: z.literal("on", "É preciso aceitar a política de privacidade."),
  })
  // `when`: compara as senhas mesmo que outros campos tenham erro (mostra tudo de uma vez).
  .refine((d) => d.password === d.password_confirm, {
    path: ["password_confirm"],
    message: "As senhas não conferem.",
    when: (p) => typeof (p.value as Record<string, unknown>)?.password_confirm === "string",
  });

export const resetRequestSchema = z.object({ email });

export const newPasswordSchema = z
  .object({ password: newPassword, password_confirm: z.string() })
  .refine((d) => d.password === d.password_confirm, { path: ["password_confirm"], message: "As senhas não conferem." });

export const profileSchema = z.object({
  full_name: z.string().trim().min(2, "Informe seu nome.").max(120),
  phone: z
    .string()
    .default("")
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v === "" || /^\d{10,11}$/.test(v), "Telefone com DDD: 10 ou 11 dígitos.")
    .transform((v) => (v === "" ? null : v)),
});

export const addressSchema = z.object({
  label: z.string().trim().min(1, "Dê um nome ao endereço (ex.: Casa).").max(40),
  recipient: z.string().trim().min(2, "Informe quem vai receber.").max(120),
  cep: z.string().transform((v) => v.replace(/\D/g, "")).refine((v) => /^\d{8}$/.test(v), "CEP com 8 dígitos."),
  street: z.string().trim().min(2, "Informe o endereço.").max(160),
  number: z.string().trim().min(1, "Informe o número.").max(20),
  complement: z.string().trim().max(80).default("").transform((v) => (v === "" ? null : v)),
  district: z.string().trim().min(2, "Informe o bairro.").max(80),
  city: z.string().trim().min(2, "Informe a cidade.").max(80),
  state: z.enum(UFS, "Escolha o estado."),
});

export const ADDRESS_FIELDS = ["label", "recipient", "cep", "street", "number", "complement", "district", "city", "state"] as const;

/** Destino após login: só caminhos internos da loja (nunca externo nem o painel). */
export function safeStoreReturnTo(value: unknown, fallback = "/minha-conta"): string {
  if (typeof value !== "string" || value.length > 300) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\r\n]/.test(value)) return fallback;
  if (value.startsWith("/admin") || value.startsWith("/auth") || value.startsWith("/login") || value.startsWith("/cadastro")) return fallback;
  return value;
}
