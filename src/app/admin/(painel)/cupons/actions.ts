"use server";
import { refresh } from "next/cache";
import { COUPON_FIELDS, couponSchema, dbErrorMessage, fieldErrors, formToObject, type FormState } from "@/lib/admin/schemas";
import { requireRole } from "@/lib/auth/session";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Cria (id null) ou edita um cupom. Cupom não é apagado: desativar mantém o histórico dos pedidos. */
export async function saveCoupon(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  if (id && !UUID_RE.test(id)) return { message: "Identificador inválido." };
  const { supabase } = await requireRole();
  const parsed = couponSchema.safeParse(formToObject(formData, COUPON_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  const { error } = id
    ? await supabase.from("coupons").update(parsed.data).eq("id", id)
    : await supabase.from("coupons").insert(parsed.data);
  if (error) {
    const duplicate = error.code === "23505";
    return { message: duplicate ? "Já existe um cupom com esse código." : dbErrorMessage(error), fieldErrors: duplicate ? { code: "Código já usado." } : undefined };
  }
  refresh();
  return { ok: true, message: id ? "Cupom salvo." : "Cupom criado." };
}
