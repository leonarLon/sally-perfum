import { z } from "zod";
import { parseBRLToCents } from "@/lib/money";

/** "Água de Rosas Nº 5" → "agua-de-rosas-n-5" (mesmo formato aceito pelo CHECK do banco). */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .default(null);

/** "bergamota, pimenta rosa ,  " → ["bergamota", "pimenta rosa"]; vazio → null (= não confirmado). */
const notesList = z
  .string()
  .default("")
  .transform((v) =>
    v
      .split(/[,\n;]/)
      .map((s) => s.trim())
      .filter(Boolean),
  )
  .pipe(z.array(z.string().max(60, "Cada nota pode ter até 60 caracteres.")).max(20, "Máximo de 20 notas."))
  .transform((list) => (list.length ? list : null));

// Checkbox HTML: "on" quando marcado; ausente quando desmarcado.
const checkbox = z
  .unknown()
  .optional()
  .transform((v) => v === "on" || v === "true");

const money = (label: string) =>
  z.string().trim().min(1, `Informe ${label}.`).transform((v, ctx) => {
    try {
      const cents = parseBRLToCents(v);
      if (cents <= 0) throw new Error();
      return cents;
    } catch {
      ctx.addIssue({ code: "custom", message: `${label[0].toUpperCase()}${label.slice(1)} inválido. Use o formato 189,90.` });
      return z.NEVER;
    }
  });

const optionalInt = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .default("")
    .transform((v, ctx) => {
      if (v === "") return null;
      const n = Number(v);
      if (!Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: "custom", message: `${label} deve ser um número inteiro entre ${min} e ${max}.` });
        return z.NEVER;
      }
      return n;
    });

export const productSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome.").max(160, "Máximo de 160 caracteres."),
    slug: z.string().trim().max(80).default(""),
    brand_id: z.uuid("Escolha a marca."),
    category_id: z.uuid("Escolha a categoria."),
    gender: z.enum(["feminino", "masculino", "unissex"], "Escolha o gênero."),
    origin: z.enum(["nacional", "importado"], "Escolha a origem."),
    concentration: optionalText(60),
    olfactory_family: optionalText(80),
    short_description: optionalText(280),
    description: optionalText(5000),
    top_notes: notesList,
    heart_notes: notesList,
    base_notes: notesList,
    highlights: notesList,
    occasion: optionalText(120),
    manufacturer: optionalText(120),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    featured: checkbox,
    commercial_review: z.enum(["pending", "approved"]).default("pending"),
  })
  .transform((p, ctx) => {
    const slug = p.slug === "" ? slugify(p.name) : p.slug;
    if (!SLUG_RE.test(slug)) {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use só letras minúsculas, números e hífens (ex.: la-vie-est-belle)." });
      return z.NEVER;
    }
    return { ...p, slug };
  });

export type ProductInput = z.output<typeof productSchema>;

export const variantSchema = z
  .object({
    sku: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z0-9][A-Z0-9-]{2,63}$/, "SKU: 3 a 64 caracteres, letras, números e hífens."),
    volume_ml: optionalInt(1, 5000, "O volume"),
    price: money("o preço"),
    compare_at: z.string().trim().default(""),
    barcode: z
      .string()
      .trim()
      .default("")
      .refine((v) => v === "" || /^\d{8,14}$/.test(v), "Código de barras: 8 a 14 dígitos.")
      .transform((v) => (v === "" ? null : v)),
    weight_g: optionalInt(1, 50000, "O peso"),
    is_active: checkbox,
    price_confirmed: checkbox,
  })
  .transform((v, ctx) => {
    let compare_at_cents: number | null = null;
    if (v.compare_at !== "") {
      try {
        compare_at_cents = parseBRLToCents(v.compare_at);
      } catch {
        ctx.addIssue({ code: "custom", path: ["compare_at"], message: "Preço \"de\" inválido. Use o formato 229,90." });
        return z.NEVER;
      }
      if (compare_at_cents <= v.price) {
        ctx.addIssue({ code: "custom", path: ["compare_at"], message: "O preço \"de\" precisa ser maior que o preço de venda." });
        return z.NEVER;
      }
    }
    return {
      sku: v.sku,
      volume_ml: v.volume_ml,
      price_cents: v.price,
      compare_at_cents,
      barcode: v.barcode,
      weight_g: v.weight_g,
      is_active: v.is_active,
      price_is_reference: !v.price_confirmed,
    };
  });

export type VariantInput = z.output<typeof variantSchema>;

export const stockSchema = z.object({
  variant_id: z.uuid(),
  mode: z.enum(["set", "in"], "Escolha o tipo de movimentação."),
  quantity: z.coerce.number("Informe a quantidade.").int("Use um número inteiro.").min(0, "A quantidade não pode ser negativa.").max(100000),
  min_stock: z.coerce.number().int("Use um número inteiro.").min(0).max(10000),
  reason: z.string().trim().min(3, "Informe o motivo (mínimo 3 caracteres).").max(200, "Máximo de 200 caracteres."),
}).refine((s) => s.mode !== "in" || s.quantity > 0, { path: ["quantity"], message: "A entrada precisa ser maior que zero." });

export const brandSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome.").max(80, "Máximo de 80 caracteres."),
    slug: z.string().trim().max(80).default(""),
    is_active: checkbox,
  })
  .transform((b, ctx) => {
    const slug = b.slug === "" ? slugify(b.name) : b.slug;
    if (!SLUG_RE.test(slug)) {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use só letras minúsculas, números e hífens." });
      return z.NEVER;
    }
    return { ...b, slug };
  });

export const categorySchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome.").max(80, "Máximo de 80 caracteres."),
    slug: z.string().trim().max(80).default(""),
    description: optionalText(500),
    position: z.coerce.number().int().min(0).max(999).default(0),
    is_active: checkbox,
  })
  .transform((c, ctx) => {
    const slug = c.slug === "" ? slugify(c.name) : c.slug;
    if (!SLUG_RE.test(slug)) {
      ctx.addIssue({ code: "custom", path: ["slug"], message: "Use só letras minúsculas, números e hífens." });
      return z.NEVER;
    }
    return { ...c, slug };
  });

/** FormData → objeto simples (campos repetidos ficam com o último valor; arquivos são ignorados). */
export function formToObject(formData: FormData, fields: readonly string[]) {
  const out: Record<string, string | undefined> = {};
  for (const f of fields) {
    const v = formData.get(f);
    out[f] = typeof v === "string" ? v : undefined;
  }
  return out;
}

export const PRODUCT_FIELDS = [
  "name", "slug", "brand_id", "category_id", "gender", "origin", "concentration", "olfactory_family",
  "short_description", "description", "top_notes", "heart_notes", "base_notes", "highlights",
  "occasion", "manufacturer", "status", "featured", "commercial_review",
] as const;
export const VARIANT_FIELDS = ["sku", "volume_ml", "price", "compare_at", "barcode", "weight_g", "is_active", "price_confirmed"] as const;
export const STOCK_FIELDS = ["variant_id", "mode", "quantity", "min_stock", "reason"] as const;

/** Estado devolvido pelas ações aos formulários (useActionState). */
export type FormState = {
  ok?: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    out[key] ??= issue.message;
  }
  return out;
}

/** Erros do Postgres/PostgREST → mensagens para o painel (sem vazar detalhes internos). */
export function dbErrorMessage(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case "23505":
      return /sku/i.test(error.message ?? "") ? "Já existe uma variante com esse SKU." : "Já existe um registro com esse slug.";
    case "23514":
      return error.message?.includes("reservada") ? error.message : "Os valores não passaram na validação do banco.";
    case "42501":
      return "Você não tem permissão para esta ação.";
    case "22023":
      return error.message ?? "Valor inválido.";
    case "P0002":
      return "Registro não encontrado.";
    default:
      return "Não foi possível salvar. Tente de novo.";
  }
}

/** Assinatura dos arquivos de imagem (não confia na extensão nem no Content-Type). */
export function detectImageType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.subarray(from, to));
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length >= 8 && png.every((b, i) => bytes[i] === b)) return { mime: "image/png", ext: "png" };
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return { mime: "image/webp", ext: "webp" };
  return null;
}

export const IMAGE_MIN_BYTES = 5 * 1024;
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
