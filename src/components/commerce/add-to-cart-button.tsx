"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProductSummary } from "@/lib/commerce/types";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";
import { useCart } from "@/stores/cart";
import { useUI } from "@/stores/ui";

/** The round "+" quick-add button from the Product Card / AI Suggestion Card. */
export function QuickAddButton({
  product,
  className,
  variantId,
  variantTitle,
}: {
  product: ProductSummary;
  className?: string;
  /** Pre-selected variant (e.g. AI picked "EU 42"). */
  variantId?: string | null;
  variantTitle?: string | null;
}) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const toast = useUI((s) => s.toast);
  const setCartOpen = useUI((s) => s.setCartOpen);
  const [done, setDone] = useState(false);

  const soldOut = !product.inStock;
  const needsChoice = product.hasOptions && !variantId;
  const vid = variantId ?? product.defaultVariantId;

  return (
    <button
      type="button"
      disabled={soldOut}
      aria-label={soldOut ? `${product.name} is sold out` : needsChoice ? `Choose options for ${product.name}` : `Add ${product.name} to cart`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (needsChoice || !vid) {
          router.push(`/products/${product.slug}`);
          return;
        }
        add({
          id: vid,
          productId: product.id,
          slug: product.slug,
          name: product.name,
          image: product.images[0]?.src ?? null,
          variantTitle: variantTitle ?? null,
          unitPrice: product.price,
          compareAtPrice: product.compareAtPrice,
          currency: product.currency,
          maxQuantity: Math.max(1, product.defaultVariantStock || 10),
        });
        setDone(true);
        setTimeout(() => setDone(false), 1400);
        toast({ title: "Added to cart", description: product.name, action: { label: "View cart", href: "/cart" } });
        setCartOpen(true);
      }}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-[transform,background-color] duration-200 hover:scale-105 hover:bg-orange hover:text-ink active:scale-95 disabled:bg-ink/30",
        done && "bg-success hover:bg-success hover:text-white",
        className,
      )}
    >
      <Icon name={done ? "check" : "add"} size={20} strokeWidth={1.8} />
    </button>
  );
}
