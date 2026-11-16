"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { pdpMeet } from "@/content/parfs-pdp";
import { cn } from "@/lib/utils/cn";
import type { PdpProduct, PdpSibling } from "./types";

/**
 * "Meet the bottle" (Étoile's "Meet the case"): large media on the left, a tab list on the right that
 * swaps the media — the film, the exploded anatomy, and this scent's own photo — plus a Compare row
 * linking to the sibling fragrances.
 */
export function PdpMeet({ product, siblings }: { product: PdpProduct; siblings: PdpSibling[] }) {
  const [active, setActive] = useState(0);
  const video = useRef<HTMLVideoElement>(null);
  const tabs = pdpMeet.tabs.map((t) => (t.key === "scent" ? { ...t, text: product.notes.length ? `${product.notes.join(" · ")}.${product.meta ? ` ${product.meta}.` : ""}` : product.tagline ?? "" } : t));
  const current = tabs[active];

  // Play the film only while its tab is open and on screen.
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (current.media.kind !== "video" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      return;
    }
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.3 });
    io.observe(v);
    return () => io.disconnect();
  }, [current.media.kind]);

  const productImage = product.gallery[0];

  return (
    <section className="bg-p-paper px-40 pb-64 text-p-text max-lg:px-[20px] max-lg:pb-[48px]">
      <div className="mx-auto grid max-w-[1920px] gap-24 max-lg:grid-cols-1 max-lg:gap-[20px] lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        {/* Media */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#0d1119] max-lg:aspect-[4/5]" data-reveal="fade" data-reveal-y="40">
          <video
            ref={video}
            src={(pdpMeet.tabs[0].media as { src: string }).src}
            poster={(pdpMeet.tabs[0].media as { poster: string }).poster}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="PARFS film"
            className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", current.media.kind === "video" ? "opacity-100" : "opacity-0")}
          />
          {tabs.map((t, i) =>
            t.media.kind === "video" ? null : (
              <div key={t.key} className={cn("absolute inset-0 transition-[opacity,transform] duration-700 ease-out-expo", i === active ? "scale-100 opacity-100" : "scale-[1.03] opacity-0")}>
                {t.media.kind === "image" ? (
                  <Image src={t.media.src} alt={t.media.alt} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-contain p-[5%]" />
                ) : productImage ? (
                  <Image src={productImage.src} alt={productImage.alt} fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />
                ) : null}
              </div>
            ),
          )}
        </div>

        {/* Tabs + compare */}
        <div className="flex flex-col gap-16 max-lg:gap-[16px]" data-reveal="fade" data-reveal-delay="0.15">
          <div className="bg-p-sand p-20 max-lg:p-[16px]">
            <p className="p-mono text-p-grey">{pdpMeet.label}</p>
            <div className="mt-12 border-t border-p-text/15 max-lg:mt-[10px]">
              {tabs.map((t, i) => {
                const open = i === active;
                return (
                  <div key={t.key} className="border-b border-p-text/15">
                    <button type="button" onClick={() => setActive(i)} aria-expanded={open} className="flex w-full items-center gap-12 py-12 text-left max-lg:gap-[12px] max-lg:py-[12px]">
                      <span className={cn("relative size-44 shrink-0 overflow-hidden max-lg:size-[40px]", t.media.kind === "image" ? "bg-[#0d1119]" : "bg-p-paper")}>
                        <Image
                          src={t.media.kind === "video" ? t.media.poster : t.media.kind === "image" ? t.media.src : productImage?.src ?? ""}
                          alt=""
                          fill
                          sizes="44px"
                          className={t.media.kind === "image" ? "object-contain p-2" : "object-cover"}
                        />
                      </span>
                      <span className="flex-1 p-mono">{t.title}</span>
                      <span aria-hidden className="p-mono text-p-grey">{open ? "–" : "+"}</span>
                    </button>
                    <div className={cn("grid transition-[grid-template-rows] duration-500 ease-out-expo", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                      <div className="overflow-hidden">
                        <p className="pb-14 pl-56 p-body fs-15 leading-[1.55] text-p-text/80 max-lg:pb-[12px] max-lg:pl-[52px] max-lg:text-[15px]">{t.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {siblings.length > 1 && (
            <div className="bg-p-sand p-20 max-lg:p-[16px]">
              <p className="p-mono text-p-grey">Compare</p>
              <div className="mt-14 grid grid-cols-3 gap-10 max-lg:mt-[12px] max-lg:gap-[10px]">
                {siblings.map((s) => (
                  <Link key={s.slug} href={`/products/${s.slug}`} className="group flex flex-col items-center gap-8 text-center max-lg:gap-[8px]">
                    <span className={cn("relative aspect-square w-full overflow-hidden bg-p-paper", s.slug === product.slug && "outline outline-1 outline-p-text")}>
                      <Image src={s.image} alt="" fill sizes="110px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    </span>
                    <span className="p-mono-sm">{s.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
