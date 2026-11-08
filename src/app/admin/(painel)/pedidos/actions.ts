"use server";
import { refresh, updateTag } from "next/cache";
import { dbErrorMessage, type FormState } from "@/lib/admin/schemas";
import { requireRole } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog/queries";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TARGETS = ["paid", "shipped", "delivered", "canceled"] as const;

/** Muda o status do pedido; o banco valida a transição e aplica o efeito no estoque. */
export async function updateOrderStatus(orderId: string, status: (typeof TARGETS)[number]): Promise<FormState> {
  if (!UUID_RE.test(orderId) || !TARGETS.includes(status)) return { message: "Pedido ou status inválido." };
  const { supabase } = await requireRole();
  const { error } = await supabase.rpc("admin_update_order_status", { p_order_id: orderId, p_status: status });
  if (error) {
    if (/transição inválida/.test(error.message)) return { message: "Esse pedido mudou de situação (ex.: reserva expirou). Recarregue a página." };
    return { message: dbErrorMessage(error) };
  }
  // Pagamento e cancelamento mudam o estoque, e a loja mostra disponibilidade.
  updateTag(CATALOG_TAG);
  refresh();
  return { ok: true, message: "Status atualizado." };
}
