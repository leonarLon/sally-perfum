import { ExternalLink, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AuditList } from "@/components/admin/audit-list";
import { ActionButton } from "@/components/admin/form-kit";
import { ImageUploadForm } from "@/components/admin/image-upload-form";
import { MOVEMENT_TYPE, PRODUCT_STATUS, STOCK_STATUS, formatDateTime } from "@/components/admin/labels";
import { ProductForm } from "@/components/admin/product-form";
import { StockForm } from "@/components/admin/stock-form";
import { VariantForm } from "@/components/admin/variant-form";
import { Badge } from "@/components/ui/badge";
import { requireRole } from "@/lib/auth/session";
import { getAdminProduct, listAudit, listBrands, listCategories, listInventory, listMovements } from "@/lib/admin/queries";
import { resolveImageUrl } from "@/lib/catalog/images";
import { updateStock } from "../../estoque/actions";
import { deleteImage, saveVariant, setPrimaryImage, updateProduct, uploadImage } from "../actions";

export const metadata = { title: "Editar produto" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/produtos/[id]">) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { user } = await requireRole();
  const product = await getAdminProduct(id);
  if (!product) notFound();

  const variantIds = product.variants.map((v) => v.id);
  const [brands, categories, inventory, movements, audit] = await Promise.all([
    listBrands(),
    listCategories(),
    listInventory({ productId: product.id }),
    listMovements(variantIds, 15),
    listAudit({ entityIds: [product.id, ...variantIds, ...product.images.map((i) => i.id)], limit: 15 }),
  ]);
  const stockBy = new Map(inventory.map((r) => [r.variant_id, r]));
  const skuBy = new Map(product.variants.map((v) => [v.id, v.sku]));
  const st = PRODUCT_STATUS[product.status];
  const skuBase = product.variants[0]?.sku.replace(/-\d+$/, "") ?? `SLY-${product.slug.toUpperCase().slice(0, 20)}`;

  return (
    <div className="max-w-5xl space-y-10">
      <div className="space-y-2">
        <Link href="/admin/produtos" className="text-sm text-primary hover:underline">
          ← Produtos
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl font-semibold">{product.name}</h1>
          <Badge variant={st.variant}>{st.label}</Badge>
          {product.status === "published" && (
            <Link href={`/produtos/${product.slug}`} target="_blank" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              Ver na loja <ExternalLink className="size-3.5" aria-hidden />
              <span className="sr-only">(abre em nova aba)</span>
            </Link>
          )}
        </div>
        {sp.criado === "1" && (
          <p role="status" className="rounded-card bg-success/10 px-4 py-2 text-sm text-success">
            Produto criado como rascunho. Agora cadastre os volumes, o estoque e as fotos.
          </p>
        )}
      </div>

      <section aria-labelledby="dados" className="space-y-4">
        <h2 id="dados" className="sr-only">
          Dados do produto
        </h2>
        <ProductForm action={updateProduct.bind(null, product.id)} product={product} brands={brands} categories={categories} />
      </section>

      <section aria-labelledby="variantes" className="space-y-4">
        <div>
          <h2 id="variantes" className="font-display text-2xl font-semibold">
            Volumes, preços e estoque
          </h2>
          <p className="text-sm text-muted">Preços em reais. A loja recebe a alteração na hora.</p>
        </div>
        {product.variants.map((v) => {
          const stock = stockBy.get(v.id);
          const ss = stock ? STOCK_STATUS[stock.stock_status] : null;
          return (
            <article key={v.id} aria-label={`Variante ${v.sku}`} className="space-y-4 rounded-card border border-border p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <strong>{v.volume_ml ? `${v.volume_ml} ml` : v.sku}</strong>
                {!v.is_active && <Badge variant="outline">Inativa</Badge>}
                {v.price_is_reference && <Badge variant="warning">Preço de referência</Badge>}
                {ss && <Badge variant={ss.variant}>{ss.label}</Badge>}
                {stock?.is_demo_quantity && <Badge variant="outline">Estoque demo</Badge>}
                {stock && (
                  <span className="text-muted">
                    {stock.on_hand} em estoque · {stock.reserved} reservadas · {stock.available} disponíveis
                  </span>
                )}
              </div>
              <VariantForm action={saveVariant.bind(null, product.id, v.id)} variant={v} />
              {stock && (
                <details className="rounded-card bg-surface p-3">
                  <summary className="cursor-pointer text-sm font-medium">Ajustar estoque</summary>
                  <div className="mt-3">
                    <StockForm key={`${stock.on_hand}-${stock.min_stock}-${stock.updated_at}`} action={updateStock} row={stock} compact />
                  </div>
                </details>
              )}
            </article>
          );
        })}
        <details className="rounded-card border border-dashed border-border p-4" open={product.variants.length === 0}>
          <summary className="cursor-pointer font-medium">Adicionar variante</summary>
          <div className="mt-4">
            <VariantForm action={saveVariant.bind(null, product.id, null)} suggestedSku={`${skuBase}-`} />
          </div>
        </details>
      </section>

      <section aria-labelledby="imagens" className="space-y-4">
        <h2 id="imagens" className="font-display text-2xl font-semibold">
          Imagens
        </h2>
        {product.images.length ? (
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.images.map((img) => {
              const src = resolveImageUrl(img);
              return (
                <li key={img.id} className="space-y-2 rounded-card border border-border p-3">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-surface">
                    {src ? <Image src={src} alt={img.alt} fill sizes="200px" className="object-contain" /> : <span className="text-xs text-muted">sem arquivo</span>}
                  </div>
                  <p className="line-clamp-2 text-xs text-muted">{img.alt}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {img.is_primary ? (
                      <Badge variant="primary">
                        <Star className="mr-1 size-3" aria-hidden /> Principal
                      </Badge>
                    ) : (
                      <ActionButton action={setPrimaryImage.bind(null, product.id, img.id)} variant="outline" aria-label={`Definir como principal: ${img.alt}`}>
                        Tornar principal
                      </ActionButton>
                    )}
                    <ActionButton
                      action={deleteImage.bind(null, product.id, img.id)}
                      variant="ghost"
                      className="text-error"
                      confirmText="Remover esta imagem? O arquivo também será apagado do armazenamento."
                      aria-label={`Remover imagem: ${img.alt}`}
                    >
                      Remover
                    </ActionButton>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-muted">Nenhuma imagem. A loja mostra um aviso de foto indisponível.</p>
        )}
        <div className="rounded-card border border-dashed border-border p-4">
          <h3 className="mb-3 font-medium">Enviar nova imagem</h3>
          <ImageUploadForm action={uploadImage.bind(null, product.id)} defaultAlt={product.name} />
        </div>
      </section>

      <section aria-labelledby="historico" className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 id="historico" className="font-display text-xl font-semibold">
            Histórico de alterações
          </h2>
          <AuditList entries={audit} currentUserId={user.id} />
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-xl font-semibold">Movimentações de estoque</h2>
          {movements.length ? (
            <ol className="divide-y divide-border rounded-card border border-border text-sm">
              {movements.map((m) => (
                <li key={m.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                  <span>
                    <strong className={m.quantity > 0 ? "text-success" : "text-error"}>
                      {m.quantity > 0 ? "+" : ""}
                      {m.quantity}
                    </strong>{" "}
                    {MOVEMENT_TYPE[m.type] ?? m.type} · {skuBy.get(m.variant_id)}
                    {m.reason && <span className="text-muted"> · {m.reason}</span>}
                  </span>
                  <time dateTime={m.created_at} className="text-xs text-muted">
                    {formatDateTime(m.created_at)}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Sem movimentações.</p>
          )}
        </div>
      </section>
    </div>
  );
}
