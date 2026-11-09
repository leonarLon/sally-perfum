export const PRODUCT_STATUS = {
  draft: { label: "Rascunho", variant: "outline" },
  published: { label: "Publicado", variant: "success" },
  archived: { label: "Arquivado", variant: "warning" },
} as const;

export const STOCK_STATUS = {
  in_stock: { label: "Em estoque", variant: "success" },
  low_stock: { label: "Baixo", variant: "warning" },
  out_of_stock: { label: "Esgotado", variant: "error" },
} as const;

export const MOVEMENT_TYPE: Record<string, string> = {
  seed: "Carga inicial (demo)",
  in: "Entrada",
  adjust: "Ajuste de contagem",
  reserve: "Reserva",
  release: "Liberação",
  sale: "Venda",
  return: "Devolução ao estoque",
};

export const AUDIT_ENTITY: Record<string, string> = {
  products: "Produto",
  product_variants: "Variante",
  product_images: "Imagem",
  inventory: "Estoque",
  brands: "Marca",
  categories: "Categoria",
  user_roles: "Papel de acesso",
  shipping_zones: "Frete",
  coupons: "Cupom",
};

export const AUDIT_ACTION = { insert: "criou", update: "alterou", delete: "removeu" } as const;

const dateFmt = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });
export const formatDateTime = (iso: string | null | undefined) => (iso ? dateFmt.format(new Date(iso)) : "—");

/** Campos técnicos que não interessam no histórico. */
const HIDDEN_FIELDS = new Set(["id", "created_at", "product_id", "variant_id", "data_sources", "published_at", "seed_key", "family_group"]);
export const visibleChangedFields = (changes: Record<string, unknown>) => Object.keys(changes).filter((k) => !HIDDEN_FIELDS.has(k));
