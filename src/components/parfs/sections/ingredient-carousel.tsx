"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useDialKit } from "dialkit";

const IMG = "/images/parfs";
/** Default auto-slide speed in CSS px per second (live-tunable in dev via DialKit). */
const SPEED = 72;
/** Copies of the list rendered so the loop never shows a gap. */
const COPIES = 3;

type Item = { name: string; icon: string };

/**
 * Figma: Ingredient carousel — 300×230 framed cards, 32px apart, first card bleeding 60px off the left edge.
 * Slides endlessly on its own; pauses on hover, drag or touch, and can be dragged / swiped either way.
 */
export function IngredientCarousel({ items }: { items: readonly Item[] }) {
  const track = useRef<HTMLDivElement>(null);
  const { speed } = useDialKit("Ingredient carousel", { speed: [SPEED, 0, 240, 1] });
  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Width of one full copy of the list (first card of copy 2 minus first card of copy 1).
    const setWidth = () => {
      const first = el.children[0] as HTMLElement | undefined;
      const second = el.children[items.length] as HTMLElement | undefined;
      return first && second ? second.offsetLeft - first.offsetLeft : 0;
    };
    // Start inside the middle copy, with the first card bleeding off-canvas as designed.
    const w = window.innerWidth;
    const bleed = w >= 1024 ? (60 * Math.min(w, 1920)) / 1440 : 0;
    let pos = setWidth() + bleed;
    el.scrollLeft = pos;

    // Jump back/forward by one copy when we drift out of the middle copy (invisible: copies are identical).
    // Returns the shift so callers can keep their own sub-pixel position in sync.
    const wrap = () => {
      const sw = setWidth();
      if (!sw) return 0;
      let shift = 0;
      if (el.scrollLeft >= sw * 2) shift = -sw;
      else if (el.scrollLeft < sw * 0.5) shift = sw;
      if (shift) el.scrollLeft += shift;
      return shift;
    };

    let paused = false;
    let visible = false;
    let down = false;
    let moved = false;
    let startX = 0;
    let startLeft = 0;
    let resumeTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce && visible && !paused && !down) {
        pos += speedRef.current * dt; // keep a sub-pixel position; scrollLeft may round
        el.scrollLeft = pos;
        pos += wrap();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const pause = () => {
      clearTimeout(resumeTimer);
      paused = true;
    };
    const resumeSoon = (ms = 1200) => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        pos = el.scrollLeft;
        paused = false;
      }, ms);
    };

    // Mouse drag (touch scrolls natively and is handled by touchstart/end + scroll).
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startLeft - dx;
      startLeft += wrap();
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.style.cursor = "";
      pos = el.scrollLeft;
    };
    const onClick = (e: MouseEvent) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onEnter = () => pause();
    const onLeave = () => resumeSoon(300);
    const onTouchStart = () => pause();
    const onTouchEnd = () => resumeSoon(1800);
    const onScroll = () => {
      if (paused || down) wrap();
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeTimer);
      io.disconnect();
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("scroll", onScroll);
    };
  }, [items.length]);

  const loop = Array.from({ length: COPIES }, (_, c) => items.map((item) => ({ item, copy: c }))).flat();

  return (
    <div
      ref={track}
      className="no-scrollbar flex cursor-grab touch-pan-x gap-32 overflow-x-auto overscroll-x-contain select-none max-lg:gap-[16px]"
      role="list"
      aria-label="Signature ingredients"
      data-reveal="fade"
      data-reveal-y="40"
    >
      {loop.map(({ item, copy }) => (
        <article
          key={`${copy}-${item.name}`}
          role="listitem"
          aria-hidden={copy !== 1 || undefined}
          className="group relative flex h-230 w-300 shrink-0 flex-col items-center justify-center gap-14 border border-p-gold/25 bg-p-paper transition-colors duration-500 hover:border-p-gold/60 max-lg:h-[230px] max-lg:w-[78vw] max-lg:max-w-[300px] max-lg:gap-[14px]"
        >
          <Corner className="top-9 left-9" src={`${IMG}/card-corner-tl.svg`} />
          <Corner className="top-9 right-9 rotate-90" src={`${IMG}/card-corner-tr.svg`} />
          <Corner className="right-9 bottom-9 rotate-180" src={`${IMG}/card-corner-br.svg`} />
          <Corner className="bottom-9 left-9 -rotate-90" src={`${IMG}/card-corner-bl.svg`} />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.icon} alt="" width={44} height={44} draggable={false} className="size-44 transition-transform duration-700 ease-out-expo group-hover:-translate-y-6 max-lg:size-[44px]" />
          <h3 className="text-center fs-13 font-medium tracking-[0.14em] whitespace-nowrap text-p-text-2 uppercase max-lg:text-[13px]">{item.name}</h3>
          <Link
            href="/about"
            draggable={false}
            tabIndex={copy !== 1 ? -1 : undefined}
            className="flex flex-col items-center"
            aria-label={`Read more about ${item.name}`}
          >
            <span className="font-script fs-24 leading-[normal] text-p-gold max-lg:text-[24px]">Read more</span>
            <span className="relative h-px w-70 overflow-hidden bg-p-gold/60 max-lg:w-[70px]">
              <span className="absolute inset-0 -translate-x-full bg-p-gold transition-transform duration-500 ease-out-expo group-hover:translate-x-0" />
            </span>
          </Link>
        </article>
      ))}
    </div>
  );
}

function Corner({ className, src }: { className: string; src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" width={20} height={20} draggable={false} className={`pointer-events-none absolute size-20 max-lg:size-[20px] ${className}`} />
  );
}
