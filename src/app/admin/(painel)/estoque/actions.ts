"use server";
import { refresh, updateTag } from "next/cache";
import { STOCK_FIELDS, dbErrorMessage, fieldErrors, formToObject, stockSchema, type FormState } from "@/lib/admin/schemas";
import { requireRole } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog/queries";

/** Contagem conferida ou entrada de mercadoria: transação no banco (admin_update_stock). */
export async function updateStock(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireRole();
  const parsed = stockSchema.safeParse(formToObject(formData, STOCK_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };
  const s = parsed.data;

  const { data, error } = await supabase.rpc("admin_update_stock", {
    p_variant_id: s.variant_id,
    p_mode: s.mode,
    p_quantity: s.quantity,
    p_min_stock: s.min_stock,
    p_reason: s.reason,
  });
  if (error) return { message: dbErrorMessage(error) };

  // A loja mostra só o status (em estoque / últimas unidades / esgotado): invalida o catálogo.
  updateTag(CATALOG_TAG);
  refresh();
  const r = data as { on_hand: number; delta: number };
  const delta = r.delta === 0 ? "sem alteração de quantidade" : `${r.delta > 0 ? "+" : ""}${r.delta}`;
  return { ok: true, message: `Estoque atualizado: ${r.on_hand} un. (${delta}).` };
}
