"use server";
import { redirect } from "next/navigation";
import { refresh, updateTag } from "next/cache";
import {
  IMAGE_MAX_BYTES,
  IMAGE_MIN_BYTES,
  PRODUCT_FIELDS,
  VARIANT_FIELDS,
  dbErrorMessage,
  detectImageType,
  fieldErrors,
  formToObject,
  productSchema,
  variantSchema,
  type FormState,
} from "@/lib/admin/schemas";
import { requireRole } from "@/lib/auth/session";
import { CATALOG_TAG, productTag } from "@/lib/catalog/queries";
import { PRODUCT_IMAGES_BUCKET } from "@/lib/catalog/images";

/**
 * Toda ação: (1) requireRole no servidor, (2) validação zod, (3) escrita com a sessão
 * do admin (RLS ativa), (4) invalidação imediata do catálogo público (updateTag).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const assertUuid = (v: string) => {
  if (!UUID_RE.test(v)) throw new Error("Identificador inválido.");
};

function invalidateCatalog(...slugs: (string | null | undefined)[]) {
  updateTag(CATALOG_TAG);
  for (const s of new Set(slugs)) if (s) updateTag(productTag(s));
  refresh();
}

export async function createProduct(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase } = await requireRole();
  const parsed = productSchema.safeParse(formToObject(formData, PRODUCT_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  // Produto novo nasce como rascunho: só pode ser publicado depois de ter variante com preço.
  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.data, status: "draft", data_sources: { origem: "cadastro manual no painel" } })
    .select("id")
    .single();
  if (error) return { message: dbErrorMessage(error) };
  invalidateCatalog();
  redirect(`/admin/produtos/${data.id}?criado=1`);
}

export async function updateProduct(productId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  assertUuid(productId);
  const { supabase } = await requireRole();
  const parsed = productSchema.safeParse(formToObject(formData, PRODUCT_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  const { data: current } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!current) return { message: "Produto não encontrado." };

  if (parsed.data.status === "published") {
    const { count } = await supabase
      .from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId)
      .eq("is_active", true);
    if (!count) return { fieldErrors: { status: "Cadastre ao menos uma variante ativa antes de publicar." }, message: "Não foi possível publicar." };
  }

  const { error } = await supabase.from("products").update(parsed.data).eq("id", productId);
  if (error) return { message: dbErrorMessage(error), fieldErrors: error.code === "23505" ? { slug: "Slug já usado por outro produto." } : undefined };
  invalidateCatalog(current.slug, parsed.data.slug);
  return { ok: true, message: "Produto salvo. A loja já mostra a versão nova." };
}

export async function saveVariant(productId: string, variantId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  assertUuid(productId);
  if (variantId) assertUuid(variantId);
  const { supabase } = await requireRole();
  const parsed = variantSchema.safeParse(formToObject(formData, VARIANT_FIELDS));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), message: "Revise os campos destacados." };

  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  if (!product) return { message: "Produto não encontrado." };

  const { error } = variantId
    ? await supabase.from("product_variants").update(parsed.data).eq("id", variantId).eq("product_id", productId)
    : await supabase.from("product_variants").insert({ ...parsed.data, product_id: productId });
  if (error) return { message: dbErrorMessage(error), fieldErrors: error.code === "23505" ? { sku: "SKU já cadastrado." } : undefined };
  invalidateCatalog(product.slug);
  return {
    ok: true,
    message: variantId ? "Variante salva." : "Variante criada. Lance a primeira entrada de estoque para ela ficar disponível.",
  };
}

export async function uploadImage(productId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  assertUuid(productId);
  const { supabase } = await requireRole();
  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return { fieldErrors: { file: "Escolha um arquivo de imagem." } };
  if (file.size < IMAGE_MIN_BYTES || file.size > IMAGE_MAX_BYTES) return { fieldErrors: { file: "A imagem deve ter entre 5 KB e 5 MB." } };
  if (alt.length < 3 || alt.length > 160) return { fieldErrors: { alt: "Descreva a imagem (3 a 160 caracteres) para leitores de tela." } };

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type) return { fieldErrors: { file: "Formato não aceito. Envie JPEG, PNG ou WebP." } };

  const { data: product } = await supabase
    .from("products")
    .select("slug, images:product_images(position, is_primary)")
    .eq("id", productId)
    .maybeSingle();
  if (!product) return { message: "Produto não encontrado." };
  const images = (product.images ?? []) as { position: number; is_primary: boolean }[];

  // Nome gerado no servidor: o nome original do arquivo nunca vira caminho.
  const path = `products/${productId}/${crypto.randomUUID()}.${type.ext}`;
  const upload = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).upload(path, bytes, { contentType: type.mime, upsert: false, cacheControl: "31536000" });
  if (upload.error) return { message: "Falha ao enviar a imagem ao armazenamento." };

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: path,
    alt,
    position: images.reduce((m, i) => Math.max(m, i.position), -1) + 1,
    is_primary: !images.some((i) => i.is_primary),
    license_note: "Enviada pelo painel administrativo.",
  });
  if (error) {
    await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
    return { message: dbErrorMessage(error) };
  }
  invalidateCatalog(product.slug);
  return { ok: true, message: "Imagem enviada." };
}

export async function setPrimaryImage(productId: string, imageId: string): Promise<FormState> {
  assertUuid(productId);
  assertUuid(imageId);
  const { supabase } = await requireRole();
  const { error } = await supabase.rpc("admin_set_primary_image", { p_image_id: imageId });
  if (error) return { message: dbErrorMessage(error) };
  const { data: product } = await supabase.from("products").select("slug").eq("id", productId).maybeSingle();
  invalidateCatalog(product?.slug);
  return { ok: true, message: "Imagem principal atualizada." };
}

export async function deleteImage(productId: string, imageId: string): Promise<FormState> {
  assertUuid(productId);
  assertUuid(imageId);
  const { supabase } = await requireRole();
  const { data: img } = await supabase
    .from("product_images")
    .select("id, storage_path, is_primary, product:products(slug)")
    .eq("id", imageId)
    .eq("product_id", productId)
    .maybeSingle();
  if (!img) return { message: "Imagem não encontrada." };

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { message: dbErrorMessage(error) };
  if (img.storage_path) await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([img.storage_path]);

  if (img.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("position")
      .limit(1)
      .maybeSingle();
    if (next) await supabase.rpc("admin_set_primary_image", { p_image_id: next.id });
  }
  const slug = (img.product as unknown as { slug: string } | null)?.slug;
  invalidateCatalog(slug);
  return { ok: true, message: "Imagem removida." };
}
