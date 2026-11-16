"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { pdpCare, pdpComposition } from "@/content/parfs-pdp";
import { cn } from "@/lib/utils/cn";
import { useAddToBag } from "../use-add-to-bag";
import { ParfsButton } from "../ui/parfs-button";
import { PdpAccordion } from "./accordion";
import { ExpressPay } from "./express-pay";
import { WishlistHeart } from "../wishlist/wishlist-heart";
import type { PdpProduct, PdpSibling } from "./types";

/**
 * Étoile-style three-column hero:
 *  left   — name, price, tagline; gallery counter + thumbnails pinned to the bottom,
 *  centre — the large gallery image (cross-slides between shots; ←/→ keys, swipe, click thumbnails),
 *  right  — scent swatches (links to the sibling fragrances), add to bag, Details / Composition / Shipping.
 * On mobile it stacks: gallery first, then info and options.
 */
export function PdpHero({ product, siblings }: { product: PdpProduct; siblings: PdpSibling[] }) {
  const [index, setIndex] = useState(0);
  const addToBag = useAddToBag();
  const total = product.gallery.length;
  const go = (d: 1 | -1) => setIndex((i) => (i + d + total) % total);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest("input,textarea")) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const [touchX, setTouchX] = useState<number | null>(null);

  const thumbs = (
    <div className="flex gap-8 max-lg:gap-[8px]">
      {product.gallery.map((m, i) => (
        <button
          key={m.src + i}
          type="button"
          onClick={() => setIndex(i)}
          aria-label={`Show image ${i + 1} of ${total}`}
          aria-current={i === index}
          className={cn(
            "relative size-72 shrink-0 overflow-hidden border transition-colors max-lg:size-[60px]",
            i === index ? "border-p-text" : "border-transparent opacity-70 hover:opacity-100",
            m.dark ? "bg-[#0d1119]" : "bg-p-sand",
          )}
        >
          <Image src={m.src} alt="" fill sizes="72px" className={m.fit === "contain" ? "object-contain p-4" : "object-cover"} />
        </button>
      ))}
    </div>
  );

  const counter = (
    <p className="p-mono text-p-grey tabular-nums">
      ( {index + 1}/{total} )
    </p>
  );

  return (
    <section className="relative bg-p-paper text-p-text lg:min-h-[100svh]">
      <div className="mx-auto grid max-w-[1920px] gap-40 px-40 pt-104 pb-56 max-lg:grid-cols-1 max-lg:gap-[28px] max-lg:px-[20px] max-lg:pt-[80px] max-lg:pb-[48px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)_minmax(0,1fr)] lg:items-stretch">
        {/* Left — info */}
        <div className="flex flex-col max-lg:order-2 lg:sticky lg:top-104 lg:h-[calc(100svh-var(--spacing)*160)]" data-reveal="fade" data-reveal-now data-reveal-delay="0.15">
          {product.no && <p className="p-mono text-p-gold">{product.no}{product.meta ? ` · ${product.meta}` : ""}</p>}
          <h1 className="mt-12 font-italiana fs-56 leading-[1] max-lg:mt-[10px] max-lg:text-[40px]">{product.name}</h1>
          <p className="mt-10 p-body fs-24 font-medium max-lg:text-[20px]">{product.price}</p>
          {product.tagline && <p className="mt-56 max-w-360 p-body fs-24 leading-[1.3] max-lg:mt-[20px] max-lg:text-[20px]">{product.tagline}</p>}
          {product.notes.length > 0 && <p className="mt-16 p-mono text-p-grey max-lg:mt-[12px]">{product.notes.join(" · ")}</p>}
          <div className="mt-auto flex flex-col gap-10 pt-40 max-lg:hidden">
            {counter}
            {thumbs}
          </div>
        </div>

        {/* Centre — gallery */}
        <div className="max-lg:order-1">
          <div
            className="relative aspect-[4/5] w-full overflow-hidden bg-p-sand lg:sticky lg:top-104 lg:aspect-auto lg:h-[calc(100svh-var(--spacing)*160)]"
            onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX === null) return;
              const dx = e.changedTouches[0].clientX - touchX;
              setTouchX(null);
              if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            }}
            data-reveal="fade"
            data-reveal-now
            data-reveal-y="30"
          >
            {product.gallery.map((m, i) => (
              <div
                key={m.src + i}
                aria-hidden={i !== index}
                className={cn(
                  "absolute inset-0 transition-[opacity,transform] duration-[900ms] ease-out-expo",
                  m.dark ? "bg-[#0d1119]" : "",
                  i === index ? "scale-100 opacity-100" : "pointer-events-none scale-[1.04] opacity-0",
                )}
              >
                <Image
                  src={m.src}
                  alt={i === index ? m.alt : ""}
                  fill
                  priority={i === 0}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className={m.fit === "contain" ? "object-contain p-[6%]" : "object-cover"}
                />
              </div>
            ))}
            <WishlistHeart slug={product.slug} name={product.name} tone="light" className="absolute top-16 right-16 z-10 max-lg:top-[12px] max-lg:right-[12px]" />
            {/* Arrows */}
            <div className="absolute inset-x-0 bottom-0 flex justify-between p-16 max-lg:p-[12px]">
              <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="flex size-40 items-center justify-center rounded-full bg-p-paper/80 p-mono text-p-text backdrop-blur transition-colors hover:bg-p-paper max-lg:size-[36px]">
                ←
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next image" className="flex size-40 items-center justify-center rounded-full bg-p-paper/80 p-mono text-p-text backdrop-blur transition-colors hover:bg-p-paper max-lg:size-[36px]">
                →
              </button>
            </div>
          </div>
          <div className="mt-[12px] flex items-center justify-between lg:hidden">
            {counter}
          </div>
          <div className="no-scrollbar mt-[10px] overflow-x-auto lg:hidden">{thumbs}</div>
        </div>

        {/* Right — options */}
        <div className="flex flex-col max-lg:order-3 lg:sticky lg:top-104 lg:self-start" data-reveal="fade" data-reveal-now data-reveal-delay="0.3">
          {siblings.length > 1 && (
            <>
              <div className="flex items-baseline justify-between">
                <p className="p-mono">
                  <span className="text-p-grey">Scent:</span> {product.name}
                </p>
                <p className="p-mono-sm text-p-gold">● Available</p>
              </div>
              <div className="mt-16 grid grid-cols-3 gap-8 max-lg:mt-[14px] max-lg:gap-[8px]">
                {siblings.map((s) => {
                  const active = s.slug === product.slug;
                  return (
                    <Link
                      key={s.slug}
                      href={`/products/${s.slug}`}
                      scroll
                      aria-current={active ? "page" : undefined}
                      className={cn("group flex flex-col gap-6 border p-6 transition-colors max-lg:gap-[6px] max-lg:p-[6px]", active ? "border-p-text" : "border-p-text/10 hover:border-p-text/40")}
                    >
                      <span className="relative aspect-square overflow-hidden bg-p-sand">
                        <Image src={s.image} alt="" fill sizes="120px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      </span>
                      <span className="truncate p-mono-sm text-p-text">{s.name}</span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          <div className="mt-28 max-lg:mt-[24px]">
            <ParfsButton theme="dark" solid onClick={() => addToBag(product.summary)} className="w-full [&>span:first-child]:flex-1 [&>span:first-child]:justify-center">
              Add to bag — {product.price}
            </ParfsButton>
            <ExpressPay onPay={() => addToBag(product.summary, { checkout: true })} />
          </div>

          <div className="mt-28 max-lg:mt-[24px]">
            <PdpAccordion
              defaultOpen={0}
              items={[
                {
                  title: "Details",
                  body: (
                    <dl className="grid grid-cols-[auto_1fr] gap-x-20 gap-y-6 max-lg:gap-x-[16px] max-lg:gap-y-[6px]">
                      {product.details.map((d) => (
                        <div key={d.label} className="contents">
                          <dt className="text-p-grey">{d.label}</dt>
                          <dd>{d.value}</dd>
                        </div>
                      ))}
                    </dl>
                  ),
                },
                {
                  title: "Composition & care",
                  body: (
                    <>
                      <ul className="flex list-disc flex-col gap-4 pl-18 max-lg:gap-[4px] max-lg:pl-[18px]">
                        {pdpComposition.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                      <p className="mt-12 max-lg:mt-[10px]">{pdpCare}</p>
                    </>
                  ),
                },
                {
                  title: "Shipping & returns",
                  body: (
                    <p>
                      Delivery options and costs are shown at checkout. See our{" "}
                      <Link href="/legal/shipping" className="underline underline-offset-4">
                        shipping
                      </Link>{" "}
                      and{" "}
                      <Link href="/legal/returns" className="underline underline-offset-4">
                        returns
                      </Link>{" "}
                      policies.
                    </p>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
