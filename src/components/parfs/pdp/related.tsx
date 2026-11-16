"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/commerce/types";
import { useAddToBag } from "../use-add-to-bag";
import type { PdpSibling } from "./types";

/** "You may also like" — the other PARFS fragrances as dark collection cards. */
export function PdpRelated({ items, summaries }: { items: PdpSibling[]; summaries: Record<string, ProductSummary> }) {
  const addToBag = useAddToBag();
  if (!items.length) return null;
  return (
    <section className="bg-gradient-to-b from-p-ink via-p-night to-p-ink px-40 py-120 text-white max-lg:px-[20px] max-lg:py-[80px]">
      <div className="mx-auto max-w-[1920px]">
        <div className="flex flex-col items-center gap-14 text-center max-lg:gap-[12px]">
          <p className="p-mono text-white/45">You may also like</p>
          <h2 className="font-italiana fs-64 leading-none max-lg:text-[40px]" data-reveal="fade">More from the Nocturne edit</h2>
        </div>
        <div className="no-scrollbar mt-56 flex snap-x snap-mandatory justify-center gap-20 overflow-x-auto max-lg:mt-[36px] max-lg:justify-start max-lg:gap-[16px]">
          {items.map((p, i) => (
            <article
              key={p.slug}
              className="group flex w-440 shrink-0 snap-start flex-col border border-white/10 bg-p-card transition-colors duration-700 hover:border-white/25 max-lg:w-[min(82vw,440px)]"
              data-reveal="fade"
              data-reveal-delay={i * 0.1}
              data-reveal-y="50"
            >
              <Link href={`/products/${p.slug}`} className="relative block aspect-[440/500] overflow-hidden">
                <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 1024px) 31vw, 82vw" className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.06]" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-110 bg-gradient-to-b from-black/55 to-transparent max-lg:h-[110px]" />
                <div className="absolute top-20 right-18 left-20 flex justify-between p-mono max-lg:top-[20px] max-lg:right-[18px] max-lg:left-[20px]">
                  <span className="text-p-gold-light">{p.no}</span>
                  <span className="text-white/50">{p.meta}</span>
                </div>
              </Link>
              <div className="flex flex-col gap-10 px-24 pt-28 pb-24 max-lg:px-[20px] max-lg:pt-[24px] max-lg:pb-[20px]">
                <Link href={`/products/${p.slug}`} className="font-italiana fs-44 leading-[normal] tracking-[0.01em] max-lg:text-[34px]">
                  {p.name}
                </Link>
                <p className="p-body fs-15 text-p-grey-cool max-lg:text-[15px]">{p.notes}</p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-white/10 px-24 py-20 font-mono-p max-lg:px-[20px] max-lg:py-[18px]">
                <span className="fs-14 text-white max-lg:text-[14px]">{p.price}</span>
                <button type="button" onClick={() => addToBag(summaries[p.slug])} className="p-mono text-p-gold-light transition-colors hover:text-white" aria-label={`Add ${p.name} to bag`}>
                  [+] <span className="p-underline">Add to bag</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
