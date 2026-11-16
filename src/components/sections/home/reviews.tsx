"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { reviews } from "@/content/home";
import { Icon } from "@/components/icons/icon";
import { cn } from "@/lib/utils/cn";

// Barcode bars (x, width) — copied from the Figma "Review Receipt" barcode.
const BARS: [number, number][] = [
  [0, 4.8], [8, 1.6], [14.4, 1.6], [24, 3.2], [30.4, 1.6], [35.2, 4.8], [44.8, 1.6], [49.6, 3.2], [59.2, 1.6], [65.6, 1.6],
  [70.4, 6.4], [80, 3.2], [86.4, 1.6], [94.4, 1.6], [99.2, 3.2], [107.2, 1.6], [115.2, 1.6], [120, 3.2], [126.4, 6.4], [136, 1.6],
  [142.4, 4.8], [150.4, 3.2],
];

function Barcode() {
  return (
    <svg viewBox="0 0 154 38" className="h-[38px] w-full max-w-[154px]" preserveAspectRatio="none" aria-hidden>
      {BARS.map(([x, w]) => (
        <rect key={x} x={x} y={0} width={w} height={38} fill="currentColor" />
      ))}
    </svg>
  );
}

/** "The receipts don't lie." — static testimonial cards (no video controls). */
export function Reviews() {
  const track = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  };
  useEffect(update, []);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 680), behavior: "smooth" });
  };

  return (
    <section aria-labelledby="reviews-title" className="overflow-hidden bg-orange pt-14 pb-14 lg:pt-24 lg:pb-[104px]">
      <div className="container-page flex items-end justify-between gap-6">
        <div className="flex flex-col gap-3.5 text-white">
          <p className="text-eyebrow">( {reviews.eyebrow.toUpperCase()} )</p>
          <h2 id="reviews-title" className="text-h1">
            {reviews.title}
          </h2>
        </div>
        <div className="hidden gap-3 sm:flex">
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => scrollBy(-1)}
            disabled={edge.start}
            className={cn("flex size-[52px] items-center justify-center rounded-full transition-[background-color,opacity]", edge.start ? "bg-white/40 text-ink/60" : "bg-ink text-white hover:bg-[#34302b]")}
          >
            <Icon name="arrow-left" size={20} />
          </button>
          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => scrollBy(1)}
            disabled={edge.end}
            className={cn("flex size-[52px] items-center justify-center rounded-full transition-[background-color,opacity]", edge.end ? "bg-white/40 text-ink/60" : "bg-white text-ink hover:bg-cream")}
          >
            <Icon name="arrow-right" size={20} />
          </button>
        </div>
      </div>

      <ul
        ref={track}
        onScroll={update}
        className="no-scrollbar mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-4 pl-4 sm:scroll-pl-8 sm:pl-8 lg:mt-12 lg:gap-5 xl:scroll-pl-20 xl:pl-20 2xl:pl-[max(80px,calc((100vw-1440px)/2))]"
        aria-label="Customer reviews"
      >
        {reviews.items.map((item, i) => (
          <li key={i} className="h-[440px] w-[290px] shrink-0 snap-start sm:h-[484px] sm:w-[320px] last:mr-4 sm:last:mr-8 xl:last:mr-20">
            {item.type === "photo" ? (
              <div className="flex h-full flex-col rounded-[24px] border border-line bg-card p-3">
                <div className="relative flex-1 overflow-hidden rounded-2xl">
                  <Image src={item.image} alt={item.alt} fill sizes="320px" className="object-cover" />
                </div>
              </div>
            ) : (
              <article className="flex h-full flex-col justify-between rounded-[24px] border border-line bg-card px-6 pt-[26px] pb-[22px]">
                <div className="flex flex-col gap-[18px]">
                  <dl className="flex flex-col gap-3 text-[12px] leading-none font-semibold">
                    <div className="flex">
                      <dt className="w-[92px] shrink-0">NAME:</dt>
                      <dd>{item.name}</dd>
                    </div>
                    <div className="flex items-center">
                      <dt className="w-[92px] shrink-0">RATING:</dt>
                      <dd className="flex gap-[3px]" aria-label={`${item.rating} out of 5 stars`}>
                        {Array.from({ length: item.rating }, (_, s) => (
                          <Icon key={s} name="star" size={14} filled />
                        ))}
                      </dd>
                    </div>
                    <div className="flex">
                      <dt className="w-[92px] shrink-0">PRODUCT:</dt>
                      <dd>
                        <Link href={`/products/${item.slug}`} className="hover:underline">
                          {item.product}
                        </Link>
                      </dd>
                    </div>
                  </dl>
                  <div className="h-px bg-line" />
                  <blockquote className="font-display text-[22px] leading-[1.18] font-bold tracking-[-0.01em] sm:text-[24px]">“{item.quote}”</blockquote>
                </div>
                <div className="flex items-end gap-4">
                  <Link href={`/products/${item.slug}`} className="relative h-16 w-[84px] shrink-0 overflow-hidden rounded-xl" aria-label={`View ${item.product.toLowerCase()}`}>
                    <Image src={item.thumb} alt="" fill sizes="84px" className="object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Barcode />
                    <p className="flex items-center gap-1.5 text-[12px] leading-none font-semibold">
                      <Icon name="check-circle" size={14} /> VERIFIED BUYER
                    </p>
                  </div>
                </div>
              </article>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
