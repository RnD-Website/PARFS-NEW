"use client";

import Image from "next/image";
import Link from "next/link";
import type { ProductSummary } from "@/lib/commerce/types";
import { parfsCollection, parfsProducts } from "@/content/parfs-home";
import { SplitText } from "../motion/split-text";
import { ParfsButton } from "../ui/parfs-button";
import { useAddToBag } from "../use-add-to-bag";

/** Figma: The Collection (1440×1396) — "The Nocturne Edit", three dark product cards. */
export function ParfsCollection({ products }: { products: Record<string, ProductSummary> }) {
  const { label, title, cta } = parfsCollection;
  const addToBag = useAddToBag();

  return (
    <section id="collection" aria-labelledby="collection-title" className="relative overflow-hidden bg-gradient-to-b from-p-ink via-p-night to-p-ink px-40 py-140 text-white max-lg:px-[20px] max-lg:py-[96px]">
      {/* Centred heading (prev/next controls removed — all three cards are visible; they swipe on mobile) */}
      <div className="flex flex-col items-center gap-16 text-center max-lg:gap-[16px]">
        <p className="flex gap-10 p-mono" data-reveal="fade">
          <span className="text-white/45">{label.no}</span>
          <span>{label.text}</span>
        </p>
        <SplitText as="h2" lines={title} className="font-italiana fs-100 uppercase max-lg:text-[clamp(48px,11vw,80px)]" lineClassName="leading-[0.92]" stagger={0.03} />
      </div>

      <div className="no-scrollbar mt-56 flex snap-x snap-mandatory gap-20 overflow-x-auto max-lg:mt-[40px] max-lg:gap-[16px]">
        {parfsProducts.map((p, i) => {
          const product = products[p.slug];
          return (
            <article
              key={p.slug}
              className="group flex min-w-0 flex-[1_0_0] snap-start flex-col border border-white/10 bg-p-card transition-colors duration-700 hover:border-white/25 max-lg:w-[min(82vw,440px)] max-lg:flex-none"
              data-reveal="fade"
              data-reveal-delay={i * 0.12}
              data-reveal-y="60"
            >
              <Link href={`/products/${p.slug}`} className="relative block h-550 overflow-hidden max-lg:h-auto max-lg:aspect-[440/550]" aria-label={`${p.name} — view details`}>
                <Image src={p.image} alt={p.imageAlt} fill sizes="(min-width: 1024px) 31vw, 82vw" className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.06]" />
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-110 bg-gradient-to-b from-black/55 to-transparent max-lg:h-[110px]" />
                <div className="absolute top-20 right-18 left-20 flex justify-between p-mono max-lg:top-[20px] max-lg:right-[18px] max-lg:left-[20px]">
                  <span className="text-p-gold-light">{p.no}</span>
                  <span className="text-white/50">{p.meta}</span>
                </div>
              </Link>
              <div className="flex flex-col gap-10 px-24 pt-28 pb-24 max-lg:px-[20px] max-lg:pt-[24px] max-lg:pb-[20px]">
                <h3 className="font-italiana fs-44 leading-[normal] tracking-[0.01em] whitespace-nowrap max-lg:text-[34px]">
                  <Link href={`/products/${p.slug}`} className="p-underline">
                    {p.name}
                  </Link>
                </h3>
                <p className="p-body fs-15 text-p-grey-cool max-lg:text-[15px]">{p.notes}</p>
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-white/10 px-24 py-20 font-mono-p max-lg:px-[20px] max-lg:py-[18px]">
                <span className="fs-14 text-white max-lg:text-[14px]">{p.price}</span>
                <button
                  type="button"
                  onClick={() => addToBag(product)}
                  className="p-mono text-p-gold-light transition-colors hover:text-white"
                  aria-label={`Add ${p.name} to bag`}
                >
                  [+] <span className="p-underline">Add to bag</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-56 flex justify-center max-lg:mt-[40px]" data-reveal="fade">
        <ParfsButton href={cta.href}>{cta.label}</ParfsButton>
      </div>
    </section>
  );
}
