/** Storefront domain types — independent of the database or any commerce platform. */

export type Money = { amount: number; currency: string };

export type ProductImage = { src: string; alt: string; width: number; height: number };

export type OptionValue = { label: string; value: string; swatch?: string };
export type ProductOption = { name: string; values: OptionValue[] };

export type Variant = {
  id: string;
  sku: string;
  title: string;
  options: Record<string, string>;
  price: number;
  stock: number;
};

export type Badge = "sale" | "new" | "ai-pick";

export type Category = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  description: string | null;
  image: string | null;
  productCount?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  highlights: string[];
  currency: string;
  price: number;
  compareAtPrice: number | null;
  rating: { average: number; count: number } | null;
  badges: Badge[];
  tags: string[];
  isNew: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  categories: Pick<Category, "id" | "slug" | "name" | "shortName">[];
  images: ProductImage[];
  options: ProductOption[];
  variants: Variant[];
  attributes: Record<string, string>;
  inStock: boolean;
};

/** Lightweight shape for cards, cart and AI results. */
export type ProductSummary = Pick<
  Product,
  | "id"
  | "slug"
  | "name"
  | "currency"
  | "price"
  | "compareAtPrice"
  | "rating"
  | "badges"
  | "categories"
  | "images"
  | "highlights"
  | "inStock"
  | "isNew"
> & { hasOptions: boolean; defaultVariantId: string | null; defaultVariantStock: number };

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

export type ProductQuery = {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  onSale?: boolean;
  isNew?: boolean;
  inStock?: boolean;
  bestSellers?: boolean;
  sort?: SortKey;
  page?: number;
  pageSize?: number;
  ids?: string[];
  slugs?: string[];
};

export type ProductPage = {
  items: ProductSummary[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  priceRange: { min: number; max: number };
};
