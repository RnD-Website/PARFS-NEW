import "server-only";
import { db } from "@/lib/db";
import { storePolicy, type DeliveryMethodId } from "@/content/site";
import { MAX_PER_LINE } from "@/stores/cart-constants";

export type IncomingLine = { variantId: string; quantity: number };

export type PricedLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  variantTitle: string | null;
  options: Record<string, string>;
  unitPrice: number;
  compareAtPrice: number | null;
  currency: string;
  quantity: number;
  stock: number;
  /** Requested quantity was reduced to what's available. */
  adjusted: boolean;
};

/**
 * Re-prices a cart from the database. The browser's cart is never trusted for prices
 * or stock — this runs for cart display, checkout summary and order creation.
 */
export async function priceCart(lines: IncomingLine[]) {
  const ids = [...new Set(lines.map((l) => l.variantId))].slice(0, 50);
  const variants = await db.variant.findMany({
    where: { id: { in: ids }, product: { status: "active" } },
    include: { product: { include: { images: { orderBy: { position: "asc" }, take: 1 } } } },
  });
  const priced: PricedLine[] = [];
  const removed: string[] = [];
  for (const l of lines) {
    const v = variants.find((x) => x.id === l.variantId);
    if (!v || v.stock <= 0) {
      removed.push(l.variantId);
      continue;
    }
    const opts = (v.product.options ?? []) as { name: string }[];
    const max = Math.min(MAX_PER_LINE, v.stock);
    const qty = Math.max(1, Math.min(max, Math.floor(l.quantity)));
    priced.push({
      variantId: v.id,
      productId: v.productId,
      slug: v.product.slug,
      name: v.product.name,
      image: v.product.images[0]?.src ?? null,
      variantTitle: opts.length ? v.title : null,
      options: (v.options ?? {}) as Record<string, string>,
      unitPrice: v.price ?? v.product.price,
      compareAtPrice: v.product.compareAtPrice,
      currency: v.product.currency,
      quantity: qty,
      stock: v.stock,
      adjusted: qty !== l.quantity,
    });
  }
  const subtotal = priced.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  return { lines: priced, removed, subtotal };
}

export function shippingFor(subtotal: number, method: DeliveryMethodId) {
  const m = storePolicy.deliveryMethods.find((d) => d.id === method) ?? storePolicy.deliveryMethods[0];
  if (method === "standard" && subtotal >= storePolicy.freeShippingThreshold) return 0;
  return m.fee;
}
