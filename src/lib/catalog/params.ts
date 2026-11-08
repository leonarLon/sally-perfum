import { z } from "zod";

/**
 * Converte searchParams da URL (não confiáveis) em filtros válidos.
 * Valores inválidos são descartados em vez de quebrar a página.
 */
export const SORTS = {
  relevance: "Relevância",
  price_asc: "Menor preço",
  price_desc: "Maior preço",
  discount: "Maior desconto",
  newest: "Novidades",
  name: "Nome (A–Z)",
} as const;
export type Sort = keyof typeof SORTS;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(80);
const reais = z.coerce.number().int().min(0).max(100_000);

const schema = z.object({
  q: z.string().trim().max(80).optional(),
  genero: z.enum(["feminino", "masculino", "unissex"]).optional(),
  origem: z.enum(["nacional", "importado"]).optional(),
  marca: slug.optional(),
  categoria: slug.optional(),
  familia: z.enum(["Floral", "Oriental", "Chipre", "Amadeirado", "Aromático", "Aquático", "Cítrico", "Gourmand"]).optional(),
  promocao: z.literal("1").optional(),
  disponivel: z.literal("1").optional(),
  min: reais.optional(),
  max: reais.optional(),
  ordem: z.enum(Object.keys(SORTS) as [Sort, ...Sort[]]).optional(),
  pagina: z.coerce.number().int().min(1).max(1000).optional(),
});

export type CatalogFilters = z.infer<typeof schema>;
type RawParams = Record<string, string | string[] | undefined>;

export function parseCatalogParams(raw: RawParams): CatalogFilters {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(schema.shape) as (keyof CatalogFilters)[]) {
    const value = raw[key];
    const single = Array.isArray(value) ? value[0] : value;
    if (single === undefined || single === "") continue;
    const parsed = schema.shape[key].safeParse(single);
    if (parsed.success && parsed.data !== undefined && parsed.data !== "") out[key] = parsed.data;
  }
  const f = out as CatalogFilters;
  if (f.min !== undefined && f.max !== undefined && f.min > f.max) [f.min, f.max] = [f.max, f.min];
  return f;
}

export const PAGE_SIZE = 24;

/** Argumentos da RPC search_catalog (preços em centavos). */
export function toSearchArgs(f: CatalogFilters, overrides: Partial<Record<string, unknown>> = {}) {
  return {
    p_q: f.q ?? null,
    p_gender: f.genero ?? null,
    p_origin: f.origem ?? null,
    p_brand: f.marca ?? null,
    p_category: f.categoria ?? null,
    p_family: f.familia ?? null,
    p_promo: f.promocao === "1",
    p_in_stock: f.disponivel === "1",
    p_min_price: f.min !== undefined ? f.min * 100 : null,
    p_max_price: f.max !== undefined ? f.max * 100 : null,
    p_sort: f.ordem ?? "relevance",
    p_page: f.pagina ?? 1,
    p_page_size: PAGE_SIZE,
    ...overrides,
  };
}

/** Monta a query string preservando filtros, com alterações pontuais (null remove). */
export function buildQuery(f: CatalogFilters, changes: Partial<Record<keyof CatalogFilters, string | number | null>> = {}) {
  const params = new URLSearchParams();
  const merged: Record<string, unknown> = { ...f, ...changes };
  // Mudar qualquer filtro volta para a página 1, exceto quando a própria página muda.
  if (!("pagina" in changes)) delete merged.pagina;
  for (const [k, v] of Object.entries(merged)) {
    if (v === null || v === undefined || v === "") continue;
    params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

export function hasActiveFilters(f: CatalogFilters) {
  return Object.keys(f).some((k) => k !== "ordem" && k !== "pagina");
}
