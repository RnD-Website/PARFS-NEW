"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import type { ProductSummary } from "@/lib/commerce/types";
import { parfsProducts } from "@/content/parfs-home";
import { ParfsButton } from "../ui/parfs-button";
import { useAddToBag } from "../use-add-to-bag";

const AUTOPLAY_MS = 6000;
const DURATION = 1.25;

/**
 * Figma: Configurator — Émeraude / Noir Absolu / Rose Lumière (1440×900 each).
 * Scenes slide: the incoming scene wipes in from the side you're heading to while its photo glides into
 * place, and the outgoing photo drifts the other way and dims — a soft parallax slide.
 * Navigate with Prev / Next, the side bottles, ←/→ keys or a swipe. Advances on its own every few seconds
 * while on screen; any manual move restarts that timer.
 */
export function ParfsConfigurator({ products }: { products: Record<string, ProductSummary> }) {
  const total = parfsProducts.length;
  const [index, setIndex] = useState(2); // the home page opens on Émeraude, as designed
  const [visible, setVisible] = useState(false);
  const [tick, setTick] = useState(0); // restarts autoplay after a manual move
  const [dir, setDir] = useState<1 | -1>(1); // travel direction, for the label slide
  const root = useRef<HTMLElement>(null);
  const scenes = useRef<(HTMLDivElement | null)[]>([]);
  const prevIndex = useRef(index);
  const dirRef = useRef<1 | -1>(1);
  const animating = useRef(false);
  const addToBag = useAddToBag();

  const at = (i: number) => parfsProducts[(i + total) % total];
  const current = at(index);
  const prev = at(index - 1);
  const next = at(index + 1);

  const go = (dir: 1 | -1, manual = true) => {
    if (animating.current) return;
    dirRef.current = dir;
    setDir(dir);
    setIndex((i) => (i + dir + total) % total);
    if (manual) setTick((t) => t + 1);
  };

  // Initial layout: only the current scene is shown.
  useEffect(() => {
    scenes.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { clipPath: i === index ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)", zIndex: i === index ? 2 : 0 });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Slide between scenes.
  useEffect(() => {
    const from = prevIndex.current;
    prevIndex.current = index;
    if (from === index) return;
    const incoming = scenes.current[index];
    const outgoing = scenes.current[from];
    if (!incoming || !outgoing) return;
    const dir = dirRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const d = reduce ? 0 : DURATION;
    animating.current = true;

    scenes.current.forEach((el, i) => el && i !== index && i !== from && gsap.set(el, { zIndex: 0, clipPath: "inset(0% 0% 0% 100%)" }));
    gsap.set(outgoing, { zIndex: 1 });
    gsap.set(incoming, { zIndex: 2, clipPath: dir === 1 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" });

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut", duration: d },
      onComplete: () => {
        gsap.set(outgoing, { zIndex: 0, clipPath: "inset(0% 0% 0% 100%)" });
        gsap.set(outgoing.querySelector("[data-img]"), { xPercent: 0, scale: 1 });
        gsap.set(outgoing.querySelector("[data-shade]"), { opacity: 0 });
        animating.current = false;
      },
    });
    tl.to(incoming, { clipPath: "inset(0% 0% 0% 0%)" }, 0)
      .fromTo(incoming.querySelector("[data-img]"), { xPercent: 22 * dir, scale: 1.08 }, { xPercent: 0, scale: 1 }, 0)
      .to(outgoing.querySelector("[data-img]"), { xPercent: -18 * dir, scale: 1.02 }, 0)
      .to(outgoing.querySelector("[data-shade]"), { opacity: 0.55 }, 0);
    return () => {
      tl.progress(1).kill();
    };
  }, [index]);

  // Autoplay while visible.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1, false), AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, tick]);

  // Swipe (touch).
  const touchX = useRef<number | null>(null);

  return (
    <section
      ref={root}
      aria-roledescription="carousel"
      aria-label="Choose your fragrance"
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
      className="relative h-[100svh] min-h-[620px] overflow-hidden bg-p-ink text-white outline-none lg:h-[max(100svh,calc(var(--spacing)*900))]"
    >
      {/* Scenes */}
      {parfsProducts.map((p, i) => (
        <div
          key={p.slug}
          ref={(el) => {
            scenes.current[i] = el;
          }}
          aria-hidden={i !== index}
          className="absolute inset-0 overflow-hidden will-change-[clip-path]"
          style={{ clipPath: i === 2 ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 0% 100%)", zIndex: i === 2 ? 2 : 0 }}
        >
          <div data-img className="absolute inset-0 will-change-transform">
            <Image src={p.configurator} alt={i === index ? `${p.name} with ${prev.name} and ${next.name}` : ""} fill sizes="100vw" className="object-cover" priority={i === 2} />
          </div>
          <div data-shade className="pointer-events-none absolute inset-0 bg-p-ink opacity-0" />
        </div>
      ))}

      {/* Side hit areas over the neighbouring bottles */}
      <button type="button" onClick={() => go(-1)} className="absolute inset-y-[20%] left-0 z-10 w-[28%] cursor-w-resize" aria-label={`Previous: ${prev.name}`} />
      <button type="button" onClick={() => go(1)} className="absolute inset-y-[20%] right-0 z-10 w-[28%] cursor-e-resize" aria-label={`Next: ${next.name}`} />

      {/* Frame-relative UI (1440×900, vertically centred) */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-900 -translate-y-1/2 max-lg:h-full">
        <button type="button" onClick={() => go(-1)} className="pointer-events-auto absolute top-440 left-40 p-mono text-white/80 transition-colors hover:text-white max-lg:top-1/2 max-lg:left-[20px]" aria-hidden tabIndex={-1}>
          ← Previous
        </button>
        <button type="button" onClick={() => go(1)} className="pointer-events-auto absolute top-440 right-40 p-mono text-white transition-colors hover:text-p-gold-light max-lg:top-1/2 max-lg:right-[20px]" aria-hidden tabIndex={-1}>
          Next →
        </button>

        <span className="absolute top-640 left-40 h-px w-330 bg-white/20 max-lg:hidden" />
        <span className="absolute top-640 left-1070 h-px w-330 bg-white/20 max-lg:hidden" />
        <SlideLabel key={`p-${prev.slug}`} className="left-336" dir={dir}>
          {prev.no} {prev.name}
        </SlideLabel>
        <SlideLabel key={`n-${next.slug}`} className="left-1116" dir={dir}>
          {next.no} {next.name}
        </SlideLabel>

        <div className="pointer-events-auto absolute top-770 left-1/2 -translate-x-1/2 max-lg:top-auto max-lg:bottom-[48px]">
          <ParfsButton onClick={() => addToBag(products[current.slug])} aria-label={`Add ${current.name} to bag, ${current.price}`}>
            <span className="relative inline-block overflow-hidden align-bottom">
              <span key={current.slug} className="inline-block animate-[p-label-in_0.9s_cubic-bezier(0.16,1,0.3,1)_both]">
                Add to bag — {current.price}
              </span>
            </span>
          </ParfsButton>
          <Link href={`/products/${current.slug}`} className="group mt-16 flex items-center justify-center gap-8 p-mono text-white/80 transition-colors hover:text-white max-lg:mt-[14px] max-lg:gap-[8px]">
            <span className="p-underline">View {current.name} details</span>
            <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
          </Link>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {current.name}, {current.notes}, {current.price}
      </p>
    </section>
  );
}

/** Neighbour name under the side bottles; slides in from the travel direction when it changes. */
function SlideLabel({ className, dir, children }: { className: string; dir: 1 | -1; children: React.ReactNode }) {
  return (
    <p
      className={`absolute top-655 -translate-x-1/2 p-mono-sm whitespace-nowrap text-white/55 max-lg:hidden ${className}`}
      style={{ animation: `${dir === 1 ? "p-slide-l" : "p-slide-r"} 1s cubic-bezier(0.16,1,0.3,1) 0.25s both` }}
    >
      {children}
    </p>
  );
}
