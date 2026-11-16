"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDialKit } from "dialkit";

type Slide = { src: string; alt: string };

const EASE = "cubic-bezier(0.77,0,0.18,1)";

/**
 * Hero background slideshow for the three-panel triptych.
 * Every few seconds the photos slide one panel to the left (the left photo wraps round to the right),
 * each panel a beat after the previous one. The 01 — 03 counter tracks the slide and its bar fills
 * over the interval. Pauses when the hero is off-screen or the tab is hidden.
 */
export function HeroSlides({ slides, counterClassName }: { slides: readonly Slide[]; counterClassName: string }) {
  const n = slides.length;
  const [slide, setSlide] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  // Live-tunable in dev via DialKit (bottom-right panel). Defaults are the shipped values.
  const dial = useDialKit("Hero slideshow", {
    autoplay: [5, 2, 12, 0.5],
    slideDuration: [1.4, 0.4, 3, 0.1],
    zoomFrom: [1.12, 1, 1.4, 0.01],
  });
  const intervalMs = dial.autoplay * 1000;
  const motion = { duration: dial.slideDuration, zoom: dial.zoomFrom };

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (root.current) io.observe(root.current);
    const id = setInterval(() => {
      if (visible && !document.hidden) setSlide((s) => (s + 1) % n);
    }, intervalMs);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [n, intervalMs]);

  return (
    <>
      <div ref={root} className="absolute inset-0">
        {/* Desktop: three panels (360 · 716 · 360 with 2px gutters) */}
        <div className="absolute inset-0 hidden lg:block">
          <Panel className="left-0 w-360" slides={slides} index={slide} offset={0} dim delay={0.15} stagger={0} drift={0.28} sizes="25vw" motion={motion} />
          <Panel className="left-362 w-716" slides={slides} index={slide} offset={1} delay={0} stagger={0.12} drift={0.42} sizes="50vw" priority motion={motion} />
          <Panel className="left-1080 w-360" slides={slides} index={slide} offset={2} dim delay={0.3} stagger={0.24} drift={0.28} sizes="25vw" motion={motion} />
        </div>
        {/* Mobile: one full-bleed panel cycling through the photos, starting on the centre one */}
        <div className="absolute inset-0 lg:hidden">
          <Panel className="left-0 w-full" slides={slides} index={slide} offset={1} delay={0} stagger={0} drift={0.35} sizes="100vw" priority motion={motion} />
        </div>
      </div>

      {/* Slide counter */}
      <div className={counterClassName} data-reveal="fade" data-reveal-now data-reveal-delay="1.3" data-reveal-y="0" aria-live="polite">
        <span className="text-white tabular-nums">{String(slide + 1).padStart(2, "0")}</span>
        <span className="relative h-px w-120 overflow-hidden bg-white/25 max-lg:w-[64px]">
          <span
            key={slide}
            className="absolute inset-y-0 left-0 w-full origin-left bg-white"
            style={{ animation: `p-track ${intervalMs}ms linear both` }}
          />
        </span>
        <span className="text-white/50 tabular-nums">{String(n).padStart(2, "0")}</span>
      </div>
    </>
  );
}

function Panel({
  className,
  slides,
  index,
  offset,
  dim,
  delay,
  stagger,
  drift,
  sizes,
  priority,
  motion,
}: {
  className: string;
  slides: readonly Slide[];
  index: number;
  offset: number;
  dim?: boolean;
  delay: number;
  stagger: number;
  drift: number;
  sizes: string;
  priority?: boolean;
  motion: { duration: number; zoom: number };
}) {
  const n = slides.length;
  const current = (index + offset) % n;

  return (
    <div className={`absolute inset-y-0 overflow-hidden ${className}`}>
      <div className="absolute inset-0 animate-[p-panel-in_2.2s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${delay}s` }}>
        <div className="absolute inset-0" data-drift={drift}>
          {slides.map((s, i) => {
            // 0 = showing, n-1 = just left (slid out to the left), anything else = waiting on the right.
            const rel = (i - current + n) % n;
            const showing = rel === 0;
            const leaving = rel === n - 1;
            return (
              <div
                key={s.src}
                aria-hidden={!showing}
                className="absolute inset-0 overflow-hidden"
                style={{
                  transform: `translateX(${showing ? 0 : leaving ? -100 : 100}%)`,
                  transition: showing || leaving ? `transform ${motion.duration}s ${EASE} ${stagger}s` : "none",
                  zIndex: showing ? 2 : leaving ? 1 : 0,
                }}
              >
                <div
                  className="absolute inset-0 transition-transform"
                  style={{
                    transform: `scale(${showing ? 1 : motion.zoom})`,
                    transitionDuration: `${motion.duration + 0.4}s`,
                    transitionTimingFunction: EASE,
                    transitionDelay: `${stagger}s`,
                  }}
                >
                  <Image src={s.src} alt={showing ? s.alt : ""} fill priority={priority && i === offset} sizes={sizes} className="object-cover" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {dim && <div className="pointer-events-none absolute inset-0 z-10 bg-p-ink/35" />}
    </div>
  );
}
