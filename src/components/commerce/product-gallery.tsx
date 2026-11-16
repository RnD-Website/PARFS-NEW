"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/commerce/types";
import { cn } from "@/lib/utils/cn";

/**
 * Main image + thumbnails (Figma "Gallery"). Desktop: click thumbnails.
 * Mobile: swipeable scroll-snap strip with dots. Images use object-cover inside fixed
 * frames — never stretched.
 */
export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const strip = useRef<HTMLDivElement>(null);
  const gallery = images.length ? images : [];
  const thumbs = gallery.slice(0, 4);

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile swipe strip */}
      <div className="md:hidden">
        <div
          ref={strip}
          onScroll={(e) => {
            const el = e.currentTarget;
            setActive(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[20px]"
          aria-label={`${name} images`}
        >
          {gallery.map((img, i) => (
            <div key={img.src} className="relative aspect-[692/520] w-full shrink-0 snap-center overflow-hidden rounded-[20px] border border-ink/10 bg-muted">
              <Image src={img.src} alt={img.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </div>
          ))}
        </div>
        {gallery.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {gallery.map((img, i) => (
              <button
                key={img.src}
                type="button"
                aria-label={`Show image ${i + 1}`}
                aria-current={active === i}
                onClick={() => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: "smooth" })}
                className={cn("h-1.5 rounded-full transition-all", active === i ? "w-6 bg-ink" : "w-1.5 bg-ink/25")}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop */}
      <div className="hidden flex-col gap-4 md:flex">
        <div className="relative aspect-[692/520] overflow-hidden rounded-[24px] border border-ink/10 bg-muted">
          {gallery[active] && (
            <Image key={gallery[active].src} src={gallery[active].src} alt={gallery[active].alt} fill priority sizes="(min-width: 1280px) 692px, 50vw" className="object-cover" />
          )}
        </div>
        {thumbs.length > 1 && (
          <div className="grid grid-cols-3 gap-4">
            {thumbs.map((img, i) =>
              i === active ? null : (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Show ${img.alt}`}
                  className="relative aspect-[220/190] overflow-hidden rounded-[20px] border border-ink/10 bg-muted transition-opacity duration-200 hover:opacity-85"
                >
                  <Image src={img.src} alt="" fill sizes="220px" className="object-cover" />
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}
