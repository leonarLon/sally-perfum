import "server-only";
import { requireRole } from "@/lib/auth/session";

/**
 * Leituras do painel. Nunca usam 'use cache': dados administrativos são sempre frescos
 * e dependem da sessão. Cada função chama requireRole() (DAL) e usa o cliente com a
 * sessão do admin — a RLS do banco continua valendo.
 */

export const ADMIN_PAGE_SIZE = 30;

export type AdminProductRow = {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  commercial_review: "pending" | "approved";
  updated_at: string;
  brand: { name: string } | null;
  category: { name: string } | null;
  variants: { id: string; price_cents: number; price_is_reference: boolean; is_active: boolean }[];
  images: { storage_path: string | null; external_url: string | null; is_primary: boolean }[];
};

export async function listAdminProducts(opts: { q?: string; status?: string; page?: number }) {
  const { supabase } = await requireRole();
  const page = Math.max(1, opts.page ?? 1);
  let query = supabase
    .from("products")
    .select(
      "id, name, slug, status, featured, commercial_review, updated_at, brand:brands(name), category:categories(name), variants:product_variants(id, price_cents, price_is_reference, is_active), images:product_images(storage_path, external_url, is_primary)",
      { count: "exact" },
    )
    .order("name")
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (opts.status && ["draft", "published", "archived"].includes(opts.status)) query = query.eq("status", opts.status);
  const q = opts.q?.trim();
  if (q) {
    // search_text já é normalizado (sem acento, minúsculo); escapa curingas do LIKE.
    const term = q.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[%_\\,()]/g, " ");
    query = query.ilike("search_text", `%${term}%`);
  }
  const { data, error, count } = await query;
  if (error) throw new Error("Falha ao listar produtos do painel.");
  return { items: (data ?? []) as unknown as AdminProductRow[], total: count ?? 0, page };
}

export type AdminProduct = {
  id: string;
  seed_key: string | null;
  brand_id: string;
  category_id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  gender: string;
  origin: string;
  concentration: string | null;
  olfactory_family: string | null;
  top_notes: string[] | null;
  heart_notes: string[] | null;
  base_notes: string[] | null;
  highlights: string[] | null;
  occasion: string | null;
  manufacturer: string | null;
  status: "draft" | "published" | "archived";
  featured: boolean;
  commercial_review: "pending" | "approved";
  data_sources: Record<string, unknown>;
  updated_at: string;
  variants: AdminVariant[];
  images: AdminImage[];
};

export type AdminVariant = {
  id: string;
  sku: string;
  barcode: string | null;
  volume_ml: number | null;
  price_cents: number;
  compare_at_cents: number | null;
  price_is_reference: boolean;
  weight_g: number | null;
  is_active: boolean;
};

export type AdminImage = {
  id: string;
  storage_path: string | null;
  external_url: string | null;
  alt: string;
  position: number;
  is_primary: boolean;
  source_url: string | null;
  license_note: string | null;
};

export type InventoryRow = {
  variant_id: string;
  sku: string;
  volume_ml: number | null;
  variant_active: boolean;
  product_id: string;
  product_name: string;
  product_status: string;
  brand_name: string;
  on_hand: number;
  reserved: number;
  available: number;
  min_stock: number;
  stock_status: "in_stock" | "low_stock" | "out_of_stock";
  is_demo_quantity: boolean;
  updated_at: string | null;
};

export async function getAdminProduct(id: string): Promise<AdminProduct | null> {
  const { supabase } = await requireRole();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data, error } = await supabase
    .from("products")
    .select(
      "*, variants:product_variants(id, sku, barcode, volume_ml, price_cents, compare_at_cents, price_is_reference, weight_g, is_active), images:product_images(id, storage_path, external_url, alt, position, is_primary, source_url, license_note)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Falha ao carregar o produto.");
  if (!data) return null;
  const p = data as unknown as AdminProduct;
  p.variants.sort((a, b) => (a.volume_ml ?? 0) - (b.volume_ml ?? 0) || a.sku.localeCompare(b.sku));
  p.images.sort((a, b) => a.position - b.position);
  return p;
}

export async function listInventory(opts: { q?: string; status?: string; productId?: string } = {}) {
  const { supabase } = await requireRole();
  await releaseExpired(supabase);
  const status = opts.status && ["in_stock", "low_stock", "out_of_stock"].includes(opts.status) ? opts.status : null;
  const { data, error } = await supabase.rpc("admin_list_inventory", {
    p_q: opts.q?.trim() || null,
    p_status: status,
    p_product_id: opts.productId ?? null,
  });
  if (error) throw new Error("Falha ao carregar o estoque.");
  return (data ?? []) as InventoryRow[];
}

export type Movement = { id: number; variant_id: string; type: string; quantity: number; reason: string | null; actor_id: string | null; created_at: string };

export async function listMovements(variantIds: string[], limit = 30) {
  const { supabase } = await requireRole();
  if (!variantIds.length) return [];
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("id, variant_id, type, quantity, reason, actor_id, created_at")
    .in("variant_id", variantIds)
    .order("id", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Falha ao carregar movimentações.");
  return (data ?? []) as Movement[];
}

export type Brand = { id: string; name: string; slug: string; is_active: boolean };
export type Category = { id: string; name: string; slug: string; description: string | null; position: number; is_active: boolean };

export async function listBrands() {
  const { supabase } = await requireRole();
  const { data, error } = await supabase.from("brands").select("id, name, slug, is_active").order("name");
  if (error) throw new Error("Falha ao carregar marcas.");
  return (data ?? []) as Brand[];
}

export async function listCategories() {
  const { supabase } = await requireRole();
  const { data, error } = await supabase.from("categories").select("id, name, slug, description, position, is_active").order("position").order("name");
  if (error) throw new Error("Falha ao carregar categorias.");
  return (data ?? []) as Category[];
}

export type AuditEntry = {
  id: number;
  actor_id: string | null;
  action: "insert" | "update" | "delete";
  entity: string;
  entity_id: string;
  changes: Record<string, unknown>;
  created_at: string;
};

export async function listAudit(opts: { entityIds?: string[]; limit?: number } = {}) {
  const { supabase } = await requireRole();
  let query = supabase
    .from("audit_logs")
    .select("id, actor_id, action, entity, entity_id, changes, created_at")
    .order("id", { ascending: false })
    .limit(opts.limit ?? 20);
  if (opts.entityIds) {
    if (!opts.entityIds.length) return [];
    query = query.in("entity_id", opts.entityIds);
  }
  const { data, error } = await query;
  if (error) throw new Error("Falha ao carregar a auditoria.");
  return (data ?? []) as AuditEntry[];
}

export type DashboardStats = Record<
  | "products_published" | "products_draft" | "products_archived" | "review_pending" | "reference_prices"
  | "variants_active" | "low_stock" | "out_of_stock" | "demo_stock"
  | "orders_pending" | "orders_to_ship" | "orders_total" | "revenue_paid_cents",
  number
>;

export async function getDashboardStats() {
  const { supabase } = await requireRole();
  await releaseExpired(supabase);
  const { data, error } = await supabase.rpc("admin_dashboard_stats");
  if (error) throw new Error("Falha ao carregar os indicadores.");
  return data as DashboardStats;
}

// ---------------------------------------------------------------------------
// Pedidos (Fase 6)
// ---------------------------------------------------------------------------
const ORDER_COLUMNS =
  "id, number, user_id, status, customer_name, customer_email, customer_phone, ship_cep, ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state, shipping_label, shipping_days_min, shipping_days_max, payment_method, subtotal_cents, shipping_cents, discount_cents, total_cents, reserved_until, is_demo, created_at, updated_at";

export type AdminOrder = {
  id: string;
  number: number;
  user_id: string | null;
  status: "pending_payment" | "paid" | "shipped" | "delivered" | "canceled" | "expired";
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  ship_cep: string;
  ship_street: string;
  ship_number: string;
  ship_complement: string | null;
  ship_district: string;
  ship_city: string;
  ship_state: string;
  shipping_label: string;
  shipping_days_min: number;
  shipping_days_max: number;
  payment_method: "pix" | "card" | "boleto";
  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  reserved_until: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminOrderItem = { id: number; variant_id: string | null; sku: string; product_name: string; brand_name: string; volume_ml: number | null; unit_price_cents: number; quantity: number; line_total_cents: number };
export type AdminPayment = {
  id: string;
  provider: string;
  provider_ref: string;
  method: "pix" | "card" | "boleto";
  status: "pending" | "approved" | "declined" | "expired" | "canceled" | "refunded" | "review";
  amount_cents: number;
  card_brand: string | null;
  card_last4: string | null;
  needs_refund: boolean;
  failure_reason: string | null;
  created_at: string;
};
export type AdminOrderEvent = { id: number; from_status: string | null; to_status: string; note: string | null; actor_id: string | null; created_at: string };

/** Expira reservas vencidas (devolve o estoque) antes de mostrar pedidos ou estoque. */
async function releaseExpired(supabase: Awaited<ReturnType<typeof requireRole>>["supabase"]) {
  await supabase.rpc("admin_release_expired_reservations");
}

export async function listOrders(opts: { status?: string; q?: string; page?: number }) {
  const { supabase } = await requireRole();
  await releaseExpired(supabase);
  const page = Math.max(1, opts.page ?? 1);
  let query = supabase
    .from("orders")
    .select("id, number, status, customer_name, customer_email, total_cents, payment_method, reserved_until, created_at, items:order_items(quantity)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE - 1);
  if (opts.status && ["pending_payment", "paid", "shipped", "delivered", "canceled", "expired"].includes(opts.status)) query = query.eq("status", opts.status);
  const q = opts.q?.trim().replace(/^#/, "");
  if (q) {
    if (/^\d{1,12}$/.test(q)) query = query.eq("number", Number(q));
    else query = query.ilike("customer_email", `%${q.replace(/[%_\,()]/g, "")}%`);
  }
  const { data, error, count } = await query;
  if (error) throw new Error("Falha ao listar pedidos.");
  type Row = Pick<AdminOrder, "id" | "number" | "status" | "customer_name" | "customer_email" | "total_cents" | "payment_method" | "reserved_until" | "created_at"> & { items: { quantity: number }[] };
  return { items: (data ?? []) as Row[], total: count ?? 0, page };
}

export async function getOrder(id: string) {
  const { supabase } = await requireRole();
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  await releaseExpired(supabase);
  const [o, items, events, payments] = await Promise.all([
    supabase.from("orders").select(ORDER_COLUMNS).eq("id", id).maybeSingle(),
    supabase.from("order_items").select("id, variant_id, sku, product_name, brand_name, volume_ml, unit_price_cents, quantity, line_total_cents").eq("order_id", id).order("id"),
    supabase.from("order_events").select("id, from_status, to_status, note, actor_id, created_at").eq("order_id", id).order("id"),
    supabase
      .from("payments")
      .select("id, provider, provider_ref, method, status, amount_cents, card_brand, card_last4, needs_refund, failure_reason, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: false }),
  ]);
  if (o.error || items.error || events.error || payments.error) throw new Error("Falha ao carregar o pedido.");
  if (!o.data) return null;
  return {
    order: o.data as AdminOrder,
    items: (items.data ?? []) as AdminOrderItem[],
    events: (events.data ?? []) as AdminOrderEvent[],
    payments: (payments.data ?? []) as AdminPayment[],
  };
}
