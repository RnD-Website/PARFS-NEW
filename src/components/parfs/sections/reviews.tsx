"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { parfsReviews } from "@/content/parfs-home";
import { cn } from "@/lib/utils/cn";
import { SplitText } from "../motion/split-text";

/**
 * Card slots relative to the front card (design px, from the Figma frame):
 * front (530,480) · back-right rotated −6° · back-left rotated +7°.
 */
const SLOTS = [
  { x: 0, y: 0, r: 0, z: 30 },
  { x: 184, y: 8.8, r: -6, z: 20 },
  { x: -190.7, y: 51.4, r: 7, z: 10 },
];

const AUTOPLAY_MS = 5500;

/** One design px in CSS px — matches the `--spacing` unit used by the stack. */
const unit = () => (window.innerWidth >= 1024 ? Math.min(window.innerWidth, 1920) / 1440 : 1);
const slotOf = (i: number, active: number, n: number) => SLOTS[Math.min((i - active + n) % n, SLOTS.length - 1)];

/**
 * Figma: Reviews (1440×1140) — "Reviews that linger", a fanned stack of paper review cards.
 * Motion: the cards fan out of a single pile when the section comes into view; Next sends the front card
 * flying off to the left and tucks it behind the stack (Prev pulls the back card out and lays it on top);
 * the stack auto-advances every few seconds while visible, pausing on hover.
 */
export function ParfsReviews() {
  const { eyebrow, title, items } = parfsReviews;
  const [active, setActive] = useState(0);
  const n = items.length;
  const cards = useRef<(HTMLElement | null)[]>([]);
  const stack = useRef<HTMLDivElement>(null);
  const prevActive = useRef(0);
  const dirRef = useRef<1 | -1>(1);
  const spread = useRef(false);
  const [inView, setInView] = useState(false);
  const [hover, setHover] = useState(false);
  const [tick, setTick] = useState(0); // bumps on manual navigation to restart the autoplay timer

  const go = (dir: 1 | -1, manual = true) => {
    dirRef.current = dir;
    setActive((a) => (a + dir + n) % n);
    if (manual) setTick((t) => t + 1);
  };
  const bringToFront = (i: number) => {
    const forward = (i - active + n) % n === 1;
    go(forward ? 1 : -1);
  };

  const place = (i: number, a: number, immediate = false) => {
    const el = cards.current[i];
    if (!el) return;
    const s = slotOf(i, a, n);
    const u = unit();
    gsap.set(el, { zIndex: s.z });
    gsap.to(el, {
      x: s.x * u,
      y: s.y * u,
      rotation: s.r,
      duration: immediate ? 0 : 1.35,
      delay: immediate ? 0 : 0.12,
      ease: "power3.inOut",
      overwrite: "auto",
    });
  };

  // Entrance: cards rise as one pile, then fan out into their slots.
  useEffect(() => {
    const root = stack.current;
    if (!root) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els = cards.current.filter(Boolean) as HTMLElement[];
    // Take over the transforms from the server-rendered inline style.
    els.forEach((el) => (el.style.transform = ""));
    if (reduce) {
      items.forEach((_, i) => place(i, 0, true));
      spread.current = true;
    } else {
      gsap.set(els, { x: 0, y: 160 * unit(), rotation: 0, autoAlpha: 0 });
    }
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && !spread.current) {
          spread.current = true;
          const tl = gsap.timeline();
          tl.to(els, { y: 0, autoAlpha: 1, duration: 0.9, ease: "power3.out", stagger: 0.08 });
          items.forEach((_, i) => {
            const el = cards.current[i];
            const sl = slotOf(i, prevActive.current, n);
            if (el) tl.to(el, { x: sl.x * unit(), y: sl.y * unit(), rotation: sl.r, duration: 1.3, ease: "expo.out" }, 0.55);
          });
        }
      },
      { threshold: 0.25 },
    );
    io.observe(root);
    const onResize = () => spread.current && items.forEach((_, i) => place(i, prevActive.current, true));
    window.addEventListener("resize", onResize);
    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shuffle when the active card changes.
  useEffect(() => {
    const from = prevActive.current;
    prevActive.current = active;
    if (from === active || !spread.current) return;
    const u = unit();
    const dir = dirRef.current;
    // Next: the old front card flies out left, then slips to the back.
    // Prev: the new front card flies out right, then lands on top.
    const flyer = dir === 1 ? from : active;
    const el = cards.current[flyer];
    items.forEach((_, i) => {
      if (i !== flyer) place(i, active);
    });
    if (!el) return;
    const s = slotOf(flyer, active, n);
    // One continuous arc — out to the side, a gentle lift, then back into its slot — so there is no stop
    // at the turn; the stacking order swaps while the card is clear of the others.
    gsap.set(el, { zIndex: dir === 1 ? 40 : 5 });
    gsap.to(el, {
      keyframes: [
        { x: dir * -420 * u, y: -36 * u, rotation: dir * -10, duration: 0.6, ease: "sine.out" },
        { x: s.x * u, y: s.y * u, rotation: s.r, duration: 0.85, ease: "sine.inOut" },
      ],
      overwrite: "auto",
    });
    gsap.delayedCall(0.55, () => gsap.set(el, { zIndex: s.z }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Autoplay while visible and not hovered.
  useEffect(() => {
    if (!inView || hover || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => go(1, false), AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, hover, tick]);

  return (
    <section aria-labelledby="reviews-title" className="relative overflow-hidden bg-p-sand text-p-text max-lg:pt-[88px] max-lg:pb-[104px] lg:h-1182">
      <p className="text-center p-mono text-p-gold lg:absolute lg:top-110 lg:left-1/2 lg:-translate-x-1/2" data-reveal="fade">
        {eyebrow}
      </p>
      <SplitText
        as="h2"
        lines={title}
        className="relative mt-[20px] text-center font-italiana fs-176 leading-[normal] tracking-[-0.01em] whitespace-nowrap text-p-gold max-lg:text-[13.4vw] max-lg:leading-[1.05] lg:absolute lg:top-150 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2"
        lineClassName="lg:h-170"
        stagger={0.04}
      />

      {/* Stack */}
      <div
        className="relative mx-auto mt-[8px] h-[290px] w-full sm:h-[500px] lg:absolute lg:inset-0 lg:mt-0 lg:h-auto"
        role="group"
        aria-roledescription="carousel"
        aria-label="Client reviews"
      >
        <div
          ref={stack}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="absolute inset-0 max-lg:top-[-221px] max-lg:left-1/2 max-lg:h-[1140px] max-lg:w-[1440px] max-lg:origin-top max-lg:-translate-x-1/2 max-lg:scale-[0.46] max-lg:sm:top-[-384px] max-lg:sm:scale-[0.8]"
        >
          {items.map((r, i) => {
            // Initial (SSR) layout only — after mount GSAP owns transform & z-index, so these stay constant.
            const slot = slotOf(i, 0, n);
            const isFront = i === active;
            return (
              <figure
                key={r.name}
                ref={(el) => {
                  cards.current[i] = el;
                }}
                aria-hidden={!isFront}
                onClick={() => !isFront && bringToFront(i)}
                className={cn(
                  "absolute top-480 left-530 flex h-420 w-380 flex-col items-center justify-center gap-18 bg-p-letter px-40 py-32 drop-shadow-[0_24px_24px_rgba(64,51,31,0.14)] will-change-transform",
                  !isFront && "cursor-pointer",
                )}
                style={{
                  transform: `translate(calc(var(--spacing) * ${slot.x}), calc(var(--spacing) * ${slot.y})) rotate(${slot.r}deg)`,
                  zIndex: slot.z,
                }}
              >
                <div className="flex flex-col items-center gap-4 text-p-gold">
                  <span className="font-italiana fs-28 leading-none">P</span>
                  <span className="font-mono-p fs-8 tracking-[0.04em] uppercase">PARFS — Maison</span>
                </div>
                <blockquote className="w-300 text-center p-body fs-15 leading-[1.6] text-p-text">{r.text}</blockquote>
                <figcaption className="flex flex-col items-center gap-20">
                  <span className="font-script fs-36 leading-[normal] whitespace-nowrap text-p-text">{r.name}</span>
                  <span className="font-mono-p fs-9 tracking-[0.04em] text-p-text/60 uppercase">{r.location}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>

      <div className="relative z-40 mt-[28px] flex justify-center gap-28 p-mono lg:absolute lg:top-1002 lg:left-1/2 lg:mt-0 lg:-translate-x-1/2" data-reveal="fade">
        <button type="button" onClick={() => go(-1)} className="text-p-text/50 transition-colors hover:text-p-text">
          ← Prev
        </button>
        <span className="text-p-gold tabular-nums" aria-live="polite">
          {String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
        </span>
        <button type="button" onClick={() => go(1)} className="text-p-text transition-colors hover:text-p-gold">
          Next →
        </button>
      </div>
    </section>
  );
}
