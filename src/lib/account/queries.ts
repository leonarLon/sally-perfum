import "server-only";
import { requireUser } from "@/lib/auth/session";
import type { CatalogItem } from "@/lib/catalog/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Leituras da área do cliente: sempre com a sessão do próprio cliente (RLS por dono).
 * Nada aqui usa service role nem 'use cache'.
 */

export type Profile = { full_name: string | null; phone: string | null };
export type Address = {
  id: string;
  label: string;
  recipient: string;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
  is_default: boolean;
};
export type MyOrder = {
  id: string;
  number: number;
  status: "pending_payment" | "paid" | "shipped" | "delivered" | "canceled" | "expired";
  total_cents: number;
  created_at: string;
  reserved_until: string | null;
};

export async function getAccount(returnTo = "/minha-conta") {
  const user = await requireUser(returnTo);
  const supabase = await createSupabaseServerClient();
  return { user, supabase };
}

export async function getProfile(returnTo?: string): Promise<Profile & { email: string | null }> {
  const { user, supabase } = await getAccount(returnTo);
  const { data } = await supabase.from("profiles").select("full_name, phone").eq("user_id", user.id).maybeSingle();
  return { full_name: data?.full_name ?? user.name, phone: data?.phone ?? null, email: user.email };
}

export async function listAddresses(returnTo?: string): Promise<Address[]> {
  const { supabase } = await getAccount(returnTo);
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("id, label, recipient, cep, street, number, complement, district, city, state, is_default")
    .order("is_default", { ascending: false })
    .order("created_at");
  if (error) throw new Error("Falha ao carregar endereços.");
  return (data ?? []) as Address[];
}

export async function listMyOrders(limit = 50): Promise<MyOrder[]> {
  const { supabase } = await getAccount("/minha-conta/pedidos");
  const { data, error } = await supabase
    .from("orders")
    .select("id, number, status, total_cents, created_at, reserved_until")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error("Falha ao carregar pedidos.");
  return (data ?? []) as MyOrder[];
}

export async function getMyOrder(id: string) {
  const { supabase } = await getAccount("/minha-conta/pedidos");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [o, items, events] = await Promise.all([
    supabase
      .from("orders")
      .select("id, number, status, customer_name, ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state, ship_cep, shipping_label, shipping_days_min, shipping_days_max, payment_method, subtotal_cents, shipping_cents, discount_cents, total_cents, reserved_until, created_at")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("order_items").select("id, sku, product_name, brand_name, product_slug, volume_ml, unit_price_cents, quantity, line_total_cents").eq("order_id", id).order("id"),
    supabase.from("order_events").select("id, to_status, created_at").eq("order_id", id).order("id"),
  ]);
  if (o.error || items.error || events.error) throw new Error("Falha ao carregar o pedido.");
  if (!o.data) return null; // de outra pessoa ou inexistente: a RLS não devolve
  return {
    order: o.data as MyOrder & Record<string, string | number | null>,
    items: (items.data ?? []) as { id: number; sku: string; product_name: string; brand_name: string; product_slug: string; volume_ml: number | null; unit_price_cents: number; quantity: number; line_total_cents: number }[],
    events: (events.data ?? []) as { id: number; to_status: MyOrder["status"]; created_at: string }[],
  };
}

export async function listFavorites(): Promise<CatalogItem[]> {
  const { supabase } = await getAccount("/minha-conta/favoritos");
  const { data: favs, error } = await supabase.from("favorites").select("product_id").order("created_at", { ascending: false });
  if (error) throw new Error("Falha ao carregar favoritos.");
  const ids = (favs ?? []).map((f) => f.product_id as string);
  if (!ids.length) return [];
  const { data } = await supabase
    .from("catalog_products")
    .select("*")
    .in("id", ids);
  const byId = new Map((data ?? []).map((p) => [p.id as string, p as unknown as CatalogItem]));
  return ids.map((id) => byId.get(id)).filter((p): p is CatalogItem => Boolean(p));
}
