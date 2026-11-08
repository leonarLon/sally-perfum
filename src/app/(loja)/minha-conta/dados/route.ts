import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Exportação dos dados pessoais (LGPD, art. 18, II e V): tudo que a pessoa tem na loja,
 * lido com a própria sessão (RLS). Download em JSON, sem cache.
 */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "não autenticado" }, { status: 401 });
  const supabase = await createSupabaseServerClient();
  const [profile, addresses, favorites, orders] = await Promise.all([
    supabase.from("profiles").select("full_name, phone, created_at, updated_at").maybeSingle(),
    supabase.from("customer_addresses").select("label, recipient, cep, street, number, complement, district, city, state, is_default, created_at"),
    supabase.from("favorites").select("created_at, product:products(name, slug)"),
    supabase
      .from("orders")
      .select("number, status, customer_name, customer_email, customer_phone, ship_cep, ship_street, ship_number, ship_complement, ship_district, ship_city, ship_state, payment_method, subtotal_cents, shipping_cents, total_cents, created_at, items:order_items(sku, product_name, quantity, unit_price_cents)"),
  ]);
  if (profile.error || addresses.error || favorites.error || orders.error) {
    return NextResponse.json({ error: "falha ao gerar a exportação" }, { status: 500 });
  }

  const body = {
    gerado_em: new Date().toISOString(),
    observacao: "Dados de um projeto de estudo (Sally Perfumaria). Valores em centavos.",
    conta: { id: user.id, email: user.email },
    perfil: profile.data,
    enderecos: addresses.data,
    favoritos: favorites.data,
    pedidos: orders.data,
  };
  return new NextResponse(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="meus-dados-sally.json"',
      "Cache-Control": "no-store",
    },
  });
}
