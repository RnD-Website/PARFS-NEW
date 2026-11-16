"use client";

import { useEffect, useMemo, useState } from "react";
import { parfsCatalog, type CatalogItem } from "@/content/parfs-catalog";
import type { ProductSummary } from "@/lib/commerce/types";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useParfsWishlist } from "@/stores/parfs-wishlist";

const NONE: string[] = [];

export type WishlistItem = { slug: string; info: CatalogItem; summary: ProductSummary | null };

/**
 * Saved slugs → display items (catalogue copy) + live store product summaries, fetched from
 * /api/products?slugs=…, so "Add to bag" works for fragrances that exist in the store's catalogue.
 * Placeholder scents simply have no summary.
 */
export function useWishlistItems(active = true) {
  const hydrated = useHydrated();
  const slugs = useParfsWishlist((s) => s.slugs);
  const [summaries, setSummaries] = useState<Record<string, ProductSummary>>({});
  const saved = useMemo(() => (hydrated ? slugs : NONE), [hydrated, slugs]);

  const items: WishlistItem[] = useMemo(
    () =>
      saved
        .map((slug) => ({ slug, info: parfsCatalog.find((c) => c.slug === slug)!, summary: summaries[slug] ?? null }))
        .filter((i) => i.info),
    [saved, summaries],
  );

  const missing = saved.filter((s) => !(s in summaries) && !parfsCatalog.find((c) => c.slug === s)?.placeholder).join(",");
  useEffect(() => {
    if (!active || !missing) return;
    let cancelled = false;
    fetch(`/api/products?slugs=${encodeURIComponent(missing)}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: ProductSummary[] }) => {
        if (!cancelled) setSummaries((prev) => ({ ...prev, ...Object.fromEntries(d.items.map((p) => [p.slug, p])) }));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [active, missing]);

  return { items, count: saved.length, hydrated };
}
