"use server";
import { refresh, updateTag } from "next/cache";
import { brandSchema, categorySchema, dbErrorMessage, fieldErrors, formToObject, type FormState } from "@/lib/admin/schemas";
import { requireRole } from "@/lib/auth/session";
import { CATALOG_TAG } from "@/lib/catalog/queries";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Marcas e categorias compartilham o mesmo fluxo: criar (id null) ou editar. */
async function saveTaxonomy(
  table: "brands" | "categories",
  id: string | null,
  formData: FormData,
): Promise<FormState> {
  if (id && !UUID_RE.test(id)) return { message: "Identificador inválido." };
  const { supabase } = await requireRole();
  const parsed =
    table === "brands"
      ? brandSchema.safeParse(formToObject(formData, ["name", "slug", "is_active"]))
      : categorySchema.safeParse(formToObject(formData, ["name", "slug", "description", "position", "is_active"]));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  const { error } = id
    ? await supabase.from(table).update(parsed.data).eq("id", id)
    : await supabase.from(table).insert(parsed.data);
  if (error) return { message: dbErrorMessage(error), fieldErrors: error.code === "23505" ? { slug: "Slug já usado." } : undefined };
  updateTag(CATALOG_TAG);
  refresh();
  return { ok: true, message: id ? "Alterações salvas." : "Cadastro criado." };
}

export async function saveBrand(id: string | null, _prev: FormState, formData: FormData) {
  return saveTaxonomy("brands", id, formData);
}

export async function saveCategory(id: string | null, _prev: FormState, formData: FormData) {
  return saveTaxonomy("categories", id, formData);
}
