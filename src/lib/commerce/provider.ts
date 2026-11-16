import type { Category, Product, ProductPage, ProductQuery, ProductSummary } from "./types";

/**
 * Everything the storefront needs from a catalogue backend.
 * Implementations: `adapters/prisma.ts` (default, PostgreSQL). A Shopify Storefront API
 * or CMS adapter only needs to implement this interface.
 */
export interface CommerceProvider {
  getCategories(): Promise<Category[]>;
  getCategory(slug: string): Promise<Category | null>;
  getProducts(query?: ProductQuery): Promise<ProductPage>;
  getProduct(slug: string): Promise<Product | null>;
  getProductsByIds(ids: string[]): Promise<Product[]>;
  getRelatedProducts(product: Product, limit?: number): Promise<ProductSummary[]>;
}
