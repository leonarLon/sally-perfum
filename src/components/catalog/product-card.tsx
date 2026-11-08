import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { resolveImageUrl } from "@/lib/catalog/images";
import type { CatalogItem } from "@/lib/catalog/types";
import { Price } from "./price";
import { ProductImage } from "./product-image";

export function volumesLabel(volumes: (number | null)[]) {
  const v = volumes.filter((x): x is number => typeof x === "number");
  if (!v.length) return null;
  return v.length === 1 ? `${v[0]} ml` : `${v.length} tamanhos (${v[0]}–${v[v.length - 1]} ml)`;
}

export function ProductCard({ item, priority = false }: { item: CatalogItem; priority?: boolean }) {
  const href = `/produtos/${item.slug}`;
  const image = resolveImageUrl({ storage_path: item.image_path, external_url: item.image_url });
  const vol = volumesLabel(item.volumes_ml);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-background transition-shadow hover:shadow-md">
      <div className="relative">
        <ProductImage
          src={image}
          alt={item.image_alt ?? `${item.name} — ${item.brand_name}`}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          priority={priority}
          className={item.in_stock ? undefined : "opacity-60"}
        />
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {item.has_promo && item.max_discount_percent > 0 ? <Badge variant="primary">-{item.max_discount_percent}%</Badge> : null}
          {!item.in_stock ? <Badge variant="outline" className="bg-background">Esgotado</Badge> : null}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">{item.brand_name}</p>
        <h3 className="font-medium leading-snug">
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {item.name}
          </Link>
        </h3>
        <p className="text-xs text-muted">
          {[item.concentration, vol].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-auto pt-2">
          <Price price={item.min_price_cents} fromPrice={item.variant_count > 1} />
        </div>
        <span className="text-sm font-medium text-primary group-hover:underline" aria-hidden>
          {item.in_stock ? "Ver detalhes" : "Ver detalhes · indisponível"}
        </span>
      </div>
    </article>
  );
}
