import Link from "next/link";
import { ProductGrid } from "@/components/catalog/product-grid";
import { listFavorites } from "@/lib/account/queries";

export const metadata = { title: "Favoritos" };

export default async function FavoritesPage() {
  const items = await listFavorites();
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Favoritos</h1>
      {items.length ? (
        <ProductGrid items={items} />
      ) : (
        <p className="text-sm text-muted">
          Nenhum favorito ainda. Toque no coração na página de um perfume para guardá-lo aqui.{" "}
          <Link href="/produtos" className="text-primary underline">
            Ver perfumes
          </Link>
        </p>
      )}
    </div>
  );
}
