import Link from "next/link";
import { ProductForm } from "@/components/admin/product-form";
import { listBrands, listCategories } from "@/lib/admin/queries";
import { createProduct } from "../actions";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);
  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/produtos" className="text-sm text-primary hover:underline">
        ← Produtos
      </Link>
      <h1 className="font-display text-3xl font-semibold">Novo produto</h1>
      <ProductForm action={createProduct} brands={brands} categories={categories} />
    </div>
  );
}
