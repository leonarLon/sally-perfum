export type Gender = "feminino" | "masculino" | "unissex";
export type Origin = "nacional" | "importado";
export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

/** Linha de catalog_products retornada por search_catalog. */
export type CatalogItem = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  gender: Gender;
  origin: Origin;
  concentration: string | null;
  olfactory_family: string | null;
  family_group: string | null;
  featured: boolean;
  brand_name: string;
  brand_slug: string;
  category_slug: string;
  category_name: string;
  min_price_cents: number;
  max_price_cents: number;
  variant_count: number;
  volumes_ml: (number | null)[];
  has_promo: boolean;
  max_discount_percent: number;
  in_stock: boolean;
  image_path: string | null;
  image_url: string | null;
  image_alt: string | null;
};

export type CatalogPage = { total: number; page: number; page_size: number; items: CatalogItem[] };

export type ProductVariant = {
  id: string;
  sku: string;
  volume_ml: number | null;
  price_cents: number;
  compare_at_cents: number | null;
  price_is_reference: boolean;
  stock_status: StockStatus;
};

export type ProductImage = {
  storage_path: string | null;
  external_url: string | null;
  alt: string;
  is_primary: boolean;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  gender: Gender;
  origin: Origin;
  concentration: string | null;
  olfactory_family: string | null;
  family_group: string | null;
  top_notes: string[] | null;
  heart_notes: string[] | null;
  base_notes: string[] | null;
  highlights: string[] | null;
  occasion: string | null;
  brand: { name: string; slug: string };
  category: { name: string; slug: string };
  variants: ProductVariant[];
  images: ProductImage[];
};

export type CatalogFacets = {
  brands: { slug: string; name: string; count: number }[];
  families: { name: string; count: number }[];
  price: { min: number | null; max: number | null };
};
