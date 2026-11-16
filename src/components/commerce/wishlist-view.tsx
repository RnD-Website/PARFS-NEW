"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ProductSummary } from "@/lib/commerce/types";
import { useWishlist } from "@/stores/wishlist";
import { useSession } from "@/stores/session";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { ProductCard, ProductCardSkeleton } from "./product-card";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/icons/icon";

export function WishlistView() {
  const hydrated = useHydrated();
  const ids = useWishlist((s) => s.ids);
  const user = useSession((s) => s.user);
  const [fetched, setFetched] = useState<{ key: string; items: ProductSummary[] } | null>(null);
  const key = ids.join(",");
  const items = !hydrated ? null : !key ? [] : fetched?.key === key ? fetched.items : fetched ? fetched.items.filter((p) => ids.includes(p.id)) : null;

  useEffect(() => {
    if (!hydrated || !key) return;
    let alive = true;
    fetch(`/api/products?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d: { items: ProductSummary[] }) => alive && setFetched({ key, items: d.items }))
      .catch(() => alive && setFetched({ key, items: [] }));
    return () => {
      alive = false;
    };
  }, [hydrated, key]);

  return (
    <div className="container-page pt-8 pb-16 lg:pt-12 lg:pb-24">
      <Eyebrow>SAVED FOR LATER</Eyebrow>
      <h1 className="mt-3.5 text-h1">Wishlist</h1>
      {!user && hydrated && ids.length > 0 && (
        <p className="mt-4 text-body-sm text-ink-muted">
          <Link href="/account/login?next=/wishlist" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>{" "}
          to keep your wishlist on every device.
        </p>
      )}
      {items === null ? (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-5 rounded-[28px] bg-card px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Icon name="heart" size={28} />
          </span>
          <p className="max-w-md text-body text-ink-muted">Tap the heart on any product to save it here.</p>
          <ButtonLink href="/shop" arrow>
            Browse products
          </ButtonLink>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
