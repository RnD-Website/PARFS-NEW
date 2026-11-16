"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parfsPromise } from "@/content/parfs-home";
import { ParfsButton } from "../ui/parfs-button";

gsap.registerPlugin(ScrollTrigger);

/**
 * Pinned "promise" section, before the footer.
 * A full-bleed photo sits behind a big centred line. As you scroll, the line parts — the first half
 * slides to the left edge, the second to the right — while a paper card rises from below into the
 * centre, its title, monogram, points and button already in place. The photo eases out of a
 * slight zoom underneath.
 */
export function ParfsPromise() {
  const { image, headline, title, points, cta } = parfsPromise;
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=170%",
          pin: true,
          scrub: 0.9,
        },
      });
      const spread = () => Math.min(window.innerWidth * 0.29, 520);
      tl.fromTo(q("[data-bg]"), { scale: 1.18 }, { scale: 1, duration: 1 }, 0)
        .fromTo(
          q("[data-half='l']"),
          { x: 0 },
          { x: () => -spread(), duration: 0.75, ease: "power2.inOut" },
          0.05,
        )
        .fromTo(
          q("[data-half='r']"),
          { x: 0 },
          { x: () => spread(), duration: 0.75, ease: "power2.inOut" },
          0.05,
        )
        .fromTo(
          q("[data-card]"),
          { yPercent: 135 },
          { yPercent: 0, duration: 0.8, ease: "power3.out" },
          0.25,
        )
        .to({}, { duration: 0.15 });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    // GSAP wraps a pinned element in a "pin-spacer"; this React-owned wrapper keeps that extra node
    // inside our tree so unmounting (client navigation) never tries to remove a re-parented section.
    <div>
      <section
        ref={root}
        aria-labelledby="promise-title"
        className="relative h-[100svh] min-h-[640px] overflow-hidden bg-p-ink text-white"
      >
        {/* Background */}
        <div data-bg className="absolute inset-0 will-change-transform">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-p-ink/45" />

        {/* Parting headline */}
        <p
          className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center gap-[0.28em] px-[20px] font-italiana fs-88 leading-none whitespace-nowrap max-lg:text-[clamp(30px,8.4vw,56px)]"
          aria-label={headline.join(" ")}
        >
          <span
            data-half="l"
            aria-hidden
            className="inline-block will-change-transform"
          >
            {headline[0]}
          </span>
          <span
            data-half="r"
            aria-hidden
            className="inline-block will-change-transform"
          >
            {headline[1]}
          </span>
        </p>

        {/* Card */}
        <div className="absolute inset-0 flex items-center justify-center px-[20px]">
          <div
            data-card
            className="flex w-460 flex-col bg-p-letter p-28 text-p-text shadow-[0_40px_80px_rgba(0,0,0,0.35)] will-change-transform max-lg:w-full max-lg:max-w-[400px] max-lg:p-[22px]"
          >
            <h2
              id="promise-title"
              data-card-item
              className="font-italiana fs-40 leading-[1.05] max-lg:text-[32px]"
            >
              {title}
            </h2>

            {/* Monogram */}
            <div
              data-card-item
              aria-hidden
              className="my-48 flex justify-center max-lg:my-[32px]"
            >
              <span className="flex size-96 items-center justify-center rounded-full border border-p-gold/70 max-lg:size-[80px]">
                <span className="font-italiana fs-48 leading-none text-p-gold max-lg:text-[40px]">
                  P
                </span>
              </span>
            </div>

            <ul className="border-t border-p-text/15">
              {points.map((pt) => (
                <li
                  key={pt}
                  data-card-item
                  className="flex items-center gap-12 border-b border-p-text/15 py-12 max-lg:gap-[12px] max-lg:py-[12px]"
                >
                  <span
                    aria-hidden
                    className="flex size-16 shrink-0 items-center justify-center rounded-full border border-p-text/70 text-[9px] leading-none max-lg:size-[16px]"
                  >
                    ✓
                  </span>
                  <span className="p-mono text-p-text">{pt}</span>
                </li>
              ))}
            </ul>

            <div
              data-card-item
              className="mt-24 flex justify-center max-lg:mt-[22px]"
            >
              <ParfsButton href={cta.href} theme="dark">
                {cta.label}
              </ParfsButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
