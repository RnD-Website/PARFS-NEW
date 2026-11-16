"use client";

import Image from "next/image";
import Link from "next/link";
import { useParfsWishlist } from "@/stores/parfs-wishlist";
import { ParfsButton } from "../ui/parfs-button";
import { useAddToBag } from "../use-add-to-bag";
import { useWishlistItems } from "./use-wishlist-items";

/** PARFS wishlist page — saved scents in the collection's card style, with Add to bag and Remove. */
export function WishlistPageView() {
  const { items, hydrated } = useWishlistItems();
  const remove = useParfsWishlist((s) => s.remove);
  const addToBag = useAddToBag();

  return (
    <section className="bg-p-paper text-p-text">
      <div className="mx-auto max-w-[1920px] px-40 pt-160 pb-140 max-lg:px-[20px] max-lg:pt-[112px] max-lg:pb-[96px]">
        <header className="flex items-end justify-between gap-24 border-b border-p-text/12 pb-28 max-lg:flex-col max-lg:items-start max-lg:gap-[12px] max-lg:pb-[22px]" data-reveal="fade" data-reveal-now>
          <h1 className="font-italiana fs-72 leading-none uppercase max-lg:text-[44px]">Wishlist</h1>
          {hydrated && items.length > 0 && (
            <p className="p-mono text-p-grey">
              {items.length} saved {items.length === 1 ? "fragrance" : "fragrances"}
            </p>
          )}
        </header>

        {!hydrated ? null : items.length === 0 ? (
          <div className="flex flex-col items-start gap-20 py-80 max-lg:gap-[18px] max-lg:py-[56px]">
            <p className="font-italiana fs-40 leading-[1.05] max-lg:text-[32px]">Nothing saved yet</p>
            <p className="max-w-480 p-body fs-16 leading-[1.55] text-p-text/75 max-lg:text-[16px]">Tap the heart on any fragrance to keep it here for later.</p>
            <ParfsButton theme="dark" href="/collection">
              Explore the collection
            </ParfsButton>
          </div>
        ) : (
          <ul className="mt-32 grid grid-cols-4 gap-16 max-lg:mt-[24px] max-lg:grid-cols-2 max-lg:gap-[12px]">
            {items.map(({ slug, info, summary }, i) => (
              <li key={slug} className="group flex flex-col animate-[p-card-in_0.8s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
                <Link href={`/products/${slug}`} className="relative block aspect-[4/5] overflow-hidden bg-p-sand">
                  <Image src={info.image} alt={info.imageAlt} fill sizes="(min-width: 1024px) 24vw, 50vw" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]" />
                </Link>
                <div className="flex items-start justify-between gap-12 pt-12 max-lg:gap-[10px] max-lg:pt-[10px]">
                  <div className="min-w-0">
                    <Link href={`/products/${slug}`} className="font-italiana fs-24 leading-[1.1] max-lg:text-[20px]">
                      {info.name}
                    </Link>
                    <p className="mt-4 p-mono-sm text-p-grey max-lg:mt-[4px]">
                      {info.concentration} · {info.volume}
                    </p>
                  </div>
                  <span className="shrink-0 p-body fs-16 font-medium max-lg:text-[15px]">${info.price}</span>
                </div>
                <div className="mt-14 flex items-center justify-between max-lg:mt-[12px]">
                  <button type="button" onClick={() => remove(slug)} className="p-mono-sm text-p-grey transition-colors hover:text-p-text">
                    Remove
                  </button>
                  {summary ? (
                    <button type="button" onClick={() => addToBag(summary)} className="p-mono text-p-text underline underline-offset-4 transition-colors hover:text-p-gold">
                      Add to bag
                    </button>
                  ) : (
                    <Link href={`/products/${slug}`} className="p-mono text-p-text underline underline-offset-4 transition-colors hover:text-p-gold">
                      View
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
