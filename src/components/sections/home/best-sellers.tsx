"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProductSummary } from "@/lib/commerce/types";
import { bestSellers } from "@/content/home";
import { Chip } from "@/components/ui/chip";
import { ProductCard } from "@/components/commerce/product-card";
import { Icon } from "@/components/icons/icon";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Figma "Best sellers" — category tabs filter the grid client-side. */
export function BestSellers({ products }: { products: ProductSummary[] }) {
  const [tab, setTab] = useState("");
  const shown = useMemo(
    () => (tab ? products.filter((p) => p.categories.some((c) => c.slug === tab)) : products).slice(0, 8),
    [products, tab],
  );
  const seeAllHref = tab ? `/shop/${tab}` : bestSellers.seeAll.href;

  return (
    <section aria-labelledby="best-title" className="bg-card py-14 lg:pt-24 lg:pb-[104px]">
      <div className="container-page">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3.5">
            <Eyebrow>{bestSellers.eyebrow.toUpperCase()}</Eyebrow>
            <h2 id="best-title" className="text-h1">
              {bestSellers.title}
            </h2>
          </div>
          <div role="group" aria-label="Filter best sellers by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {bestSellers.tabs.map((t) => (
              <Chip key={t.label} active={tab === t.value} onClick={() => setTab(t.value)}>
                {t.label}
              </Chip>
            ))}
          </div>
        </div>

        {shown.length ? (
          <ul className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-y-10">
            {shown.map((p, i) => (
              <li key={p.id} className="animate-fade-in">
                <ProductCard product={p} priority={i < 4} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-[20px] bg-muted p-8 text-center text-body text-ink-muted">No best sellers in this category yet.</p>
        )}

        <div className="mt-8 flex justify-center">
          <Link href={seeAllHref} className="group inline-flex items-center gap-3 font-display text-[26px] leading-[1.15] font-extrabold tracking-[-0.02em] lg:text-[28px]">
            <span className="underline decoration-2 underline-offset-[6px]">{bestSellers.seeAll.label}</span>
            <Icon name="arrow-right" size={26} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
