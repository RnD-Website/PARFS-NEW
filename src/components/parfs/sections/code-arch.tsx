"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils/cn";

gsap.registerPlugin(ScrollTrigger);

const IMG = "/images/parfs";
/** Outer arch circle in design px: (130,300) 1180×1180 → centre (720,890), r 590. */
const CX = 720;
const CY = 890;
const R = 590;
const STEP_MS = 1900;

type Marker = { n: number; x: number; y: number };

/**
 * The Parfs Code arch, animated:
 *  • both arches open outward from the top as the section scrolls in,
 *  • the six markers appear one after another,
 *  • a gold light then travels along the arch, lighting each marker in turn (1 → 6 → 1 …),
 *    and the monogram seal below gives a soft pulse on every step.
 */
export function CodeArch({ markers }: { markers: readonly Marker[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [running, setRunning] = useState(false);

  // Angle (deg, clockwise from 12 o'clock) of every marker's diamond on the outer arch.
  const angles = markers.map((m) => (Math.atan2(m.x - CX, CY - (m.y + 31)) * 180) / Math.PI);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        q("[data-arch]"),
        { clipPath: "circle(0% at 50% 0%)", scale: 0.92 },
        {
          clipPath: "circle(75% at 50% 0%)",
          scale: 1,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 85%", end: "top 15%", scrub: 0.8 },
        },
      );
      gsap.fromTo(
        q("[data-marker]"),
        { autoAlpha: 0, y: 12, scale: 0.6 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "back.out(2)",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 55%", once: true, onEnter: () => gsap.delayedCall(1, () => setRunning(true)) },
        },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  // Step the light from marker to marker while the section is on screen.
  useEffect(() => {
    if (!running) return;
    const el = root.current;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    if (el) io.observe(el);
    const id = setInterval(() => {
      if (visible) setActive((a) => (a + 1) % markers.length);
    }, STEP_MS);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [running, markers.length]);

  // Broadcast the step so the seal (rendered elsewhere in the section) can pulse.
  useEffect(() => {
    if (!running) return;
    document.dispatchEvent(new CustomEvent("parfs:code-step", { detail: active }));
  }, [active, running]);

  return (
    <div ref={root} aria-hidden className="pointer-events-none max-lg:relative max-lg:-mx-[20px] max-lg:mt-[16px] max-lg:h-[calc(100vw/1100*170)] lg:absolute lg:inset-0">
      <div className="absolute inset-0 max-lg:-top-[calc(100vw/1100*262)] max-lg:-left-[calc(100vw/1100*170)] max-lg:w-[calc(100vw/1100*1440)] max-lg:[--spacing:calc(100vw/1100)]">
        <div data-arch className="absolute top-300 left-130 size-1180 origin-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/code-arch-outer.svg`} alt="" width={1180} height={1180} className="size-full" />
        </div>
        <div data-arch className="absolute top-330 left-160 size-1120 origin-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${IMG}/code-arch-inner.svg`} alt="" width={1120} height={1120} className="size-full" />
        </div>

        {/* Travelling light — rotates around the arch centre, so it follows the curve exactly */}
        <div
          className={cn("absolute size-0 transition-[rotate,opacity] duration-[1.4s] ease-[cubic-bezier(0.65,0,0.35,1)]", running ? "opacity-100" : "opacity-0")}
          style={{ left: `calc(var(--spacing) * ${CX})`, top: `calc(var(--spacing) * ${CY})`, rotate: `${angles[active]}deg` }}
        >
          <span
            className="absolute left-0 size-8 -translate-1/2 rounded-full bg-p-gold shadow-[0_0_12px_4px_rgba(168,134,90,0.45)] max-lg:hidden"
            style={{ top: `calc(var(--spacing) * ${-R})` }}
          />
        </div>

        {markers.map((m, i) => {
          const on = i === active;
          return (
            <div
              key={m.n}
              data-marker
              className="absolute flex -translate-x-1/2 flex-col items-center gap-6"
              style={{ left: `calc(var(--spacing) * ${m.x})`, top: `calc(var(--spacing) * ${m.y})` }}
            >
              <span className={cn("fs-10 font-mono-p leading-none tracking-[0.04em] transition-colors duration-700 max-lg:text-[8px]", on ? "text-p-gold" : "text-p-gold/60")}>{m.n}</span>
              <span className="relative flex size-24 items-center justify-center max-lg:size-[14px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMG}/code-marker.svg`}
                  alt=""
                  width={18}
                  height={18}
                  className={cn("size-18 transition-[opacity,scale] duration-700 max-lg:size-[11px]", on ? "scale-125 opacity-0" : "scale-100 opacity-100")}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${IMG}/code-marker-active.svg`}
                  alt=""
                  width={24}
                  height={24}
                  className={cn("absolute inset-0 size-24 transition-[opacity,scale] duration-700 max-lg:size-[14px]", on ? "scale-100 opacity-100" : "scale-75 opacity-0")}
                />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** The monogram seal; gives a soft ripple each time the arch light moves on. */
export function CodeSeal({ className }: { className?: string }) {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    const on = () => setPulse((p) => p + 1);
    document.addEventListener("parfs:code-step", on);
    return () => document.removeEventListener("parfs:code-step", on);
  }, []);
  return (
    <div className={className} data-reveal="fade" data-reveal-delay="0.45" aria-hidden>
      <span className="font-italiana fs-28 leading-none text-p-gold max-lg:text-[24px]">P</span>
      {pulse > 0 && (
        <span key={pulse} className="absolute inset-[-1px] animate-[p-ripple_1.6s_cubic-bezier(0.16,1,0.3,1)_both] rounded-full border border-p-gold/50" />
      )}
    </div>
  );
}
