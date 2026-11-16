"use client";

import { useRouter } from "next/navigation";
import type { ProductSummary } from "@/lib/commerce/types";
import { useCart } from "@/stores/cart";
import { useUI } from "@/stores/ui";

/**
 * Adds a PARFS product to the store cart and opens the bag — or, with `{ checkout: true }` (the express
 * pay buttons), goes straight to checkout instead.
 * If the product isn't available from the catalogue (database offline / not seeded yet), it says so instead.
 */
export function useAddToBag() {
  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const toast = useUI((s) => s.toast);
  const router = useRouter();

  return (product: ProductSummary | null | undefined, opts?: { checkout?: boolean }) => {
    if (!product || !product.inStock || !product.defaultVariantId) {
      toast(
        product && !product.inStock
          ? { title: `${product.name} is sold out`, tone: "error" }
          : { title: "Couldn't add to bag", description: "Please try again in a moment.", tone: "error" },
      );
      return;
    }
    add({
      id: product.defaultVariantId,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.src ?? null,
      variantTitle: null,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      currency: product.currency,
      maxQuantity: Math.max(1, product.defaultVariantStock || 10),
    });
    if (opts?.checkout) router.push("/checkout");
    else setCartOpen(true);
  };
}
