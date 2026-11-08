export const PRODUCT_IMAGES_BUCKET = "product-images";

/**
 * URL pública da imagem: Storage do Supabase quando já enviada; senão a URL externa
 * documentada na carga inicial; senão null (o componente mostra placeholder identificado).
 */
export function resolveImageUrl(
  img: { storage_path?: string | null; external_url?: string | null } | null | undefined,
  supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string | null {
  if (!img) return null;
  if (img.storage_path && supabaseUrl) {
    const path = img.storage_path.split("/").map(encodeURIComponent).join("/");
    return `${supabaseUrl}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${path}`;
  }
  if (img.external_url && /^https:\/\//.test(img.external_url)) return img.external_url;
  return null;
}
