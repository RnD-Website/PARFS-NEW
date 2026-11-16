"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parfsAnatomy } from "@/content/parfs-home";
import { cn } from "@/lib/utils/cn";
import { SplitText } from "../motion/split-text";

gsap.registerPlugin(ScrollTrigger);

/**
 * The exploded-view cut-out (1333×2000, transparent background) split into its five parts.
 * All values are % of the image:
 *  top/bottom — the horizontal band each part occupies (cuts sit in the empty gaps between parts),
 *  shift      — how far the part moves down to sit in the assembled bottle,
 *  cy         — the part's vertical centre once exploded (where its label points),
 *  half       — half the part's width, so leader lines stop just short of it,
 *  blend      — parts that sit inside / behind others are screened through ("lighten").
 * Hotspot i labels part i.
 */
const PARTS = [
  {
    top: 0,
    bottom: 12.7,
    shift: 48.55,
    cy: 7,
    half: 12.2,
    side: "left",
    blend: false,
    z: 5,
  }, // solid brass cap
  {
    top: 12.7,
    bottom: 38.85,
    shift: 37.45,
    cy: 17.5,
    half: 6.2,
    side: "right",
    blend: true,
    z: 4,
  }, // fine-mist atomiser
  {
    top: 38.85,
    bottom: 46.35,
    shift: 20.35,
    cy: 42.75,
    half: 8.8,
    side: "left",
    blend: true,
    z: 3,
  }, // hand-polished collar
  {
    top: 46.35,
    bottom: 62.9,
    shift: 25.5,
    cy: 54.5,
    half: 10.8,
    side: "right",
    blend: true,
    z: 2,
  }, // perfume concentrate
  {
    top: 62.9,
    bottom: 100,
    shift: 0,
    cy: 79.8,
    half: 20.3,
    side: "left",
    blend: false,
    z: 1,
  }, // weighted smoked glass
] as const;
/** Moves the closed bottle up so it sits centred before it opens (its centre is 23% below the image centre). */
const ASSEMBLED_LIFT = -23.2;
/** The closed bottle is shown larger, then eases back to 1 as it comes apart (so the open diagram still fits). */
const ASSEMBLED_SCALE = 1.35;

/**
 * Figma: The Anatomy — rebuilt in the Prägen Hätlen style.
 * Desktop: the section pins. A centred heading sits at the top while the closed bottle rises into view;
 * the heading lifts away, the bottle comes apart part by part, then labelled leader lines draw in on both sides.
 * Mobile: heading, the exploded view and a list of the parts.
 */
export function ParfsAnatomy() {
  const { label, statement, spec, image, hotspots } = parfsAnatomy;
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px)", () => {
      const q = gsap.utils.selector(el);
      const parts = q("[data-part]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: el,
          start: "top top",
          end: "+=240%",
          pin: true,
          scrub: 0.9,
        },
      });

      // 1 — closed bottle rises from below, starting just after the heading begins to leave, so the
      //     two never overlap (the heading is gone before the cap reaches it)
      tl.fromTo(
        q("[data-stack]"),
        { yPercent: 62, scale: 1.2 },
        {
          yPercent: 0,
          scale: ASSEMBLED_SCALE,
          duration: 1.0,
          ease: "power2.out",
        },
        0.35,
      );
      tl.fromTo(
        q("[data-assembly]"),
        { yPercent: ASSEMBLED_LIFT },
        { yPercent: ASSEMBLED_LIFT, duration: 1.2 },
        0,
      );
      parts.forEach((p, i) =>
        tl.fromTo(
          p,
          { yPercent: PARTS[i].shift },
          { yPercent: PARTS[i].shift, duration: 1.2 },
          0,
        ),
      );

      // 2 — heading lifts away first
      tl.to(
        q("[data-head]"),
        { yPercent: -70, autoAlpha: 0, duration: 0.5, ease: "power1.inOut" },
        0,
      );

      // 3 — the bottle comes apart, top part first
      tl.to(
        q("[data-assembly]"),
        { yPercent: 0, duration: 1.4, ease: "power2.inOut" },
        1.4,
      );
      tl.to(
        q("[data-stack]"),
        { scale: 1, duration: 1.4, ease: "power2.inOut" },
        1.4,
      ); // settle to full-height diagram
      parts.forEach((p, i) =>
        tl.to(
          p,
          { yPercent: 0, duration: 1.4, ease: "power2.inOut" },
          1.4 + (PARTS.length - 1 - i) * 0.06,
        ),
      );

      // 4 — leader lines draw towards each part, then the labels appear
      q("[data-hotspot]").forEach((h, i) => {
        const at = 2.6 + i * 0.22;
        tl.fromTo(
          h.querySelector("[data-line]"),
          { scaleX: 0 },
          { scaleX: 1, duration: 0.45, ease: "power2.out" },
          at,
        )
          .fromTo(
            h.querySelector("[data-dot]"),
            { autoAlpha: 0, scale: 0 },
            { autoAlpha: 1, scale: 1, duration: 0.2 },
            at + 0.3,
          )
          .fromTo(
            h.querySelector("[data-text]"),
            { autoAlpha: 0, y: 8 },
            { autoAlpha: 1, y: 0, duration: 0.35 },
            at + 0.15,
          );
      });
      tl.to({}, { duration: 0.6 }); // hold on the finished diagram
    });
    return () => mm.revert();
  }, []);

  return (
    // GSAP wraps a pinned element in a "pin-spacer"; this React-owned wrapper keeps that extra node
    // inside our tree so unmounting (client navigation) never tries to remove a re-parented section.
    <div>
      <section
        ref={root}
        aria-labelledby="anatomy-statement"
        className="relative overflow-hidden bg-gradient-to-b from-p-ink via-[#0d1119] to-p-ink text-white max-lg:pt-[96px] max-lg:pb-[72px] lg:h-[100svh] lg:min-h-[620px]"
      >
        {/* Heading */}
        <div
          data-head
          className="relative z-10 mx-auto flex max-w-[640px] flex-col items-center px-[20px] text-center lg:absolute lg:top-[11svh] lg:left-1/2 lg:w-680 lg:max-w-none lg:-translate-x-1/2 lg:px-0"
        >
          <p className="flex gap-10 p-mono" data-reveal="fade">
            <span className="text-white/45">{label.no}</span>
            <span>{label.text}</span>
          </p>
          <SplitText
            as="h2"
            lines={statement}
            by="word"
            className="mt-20 font-italiana fs-48 leading-[1.12] max-lg:mt-[18px] max-lg:text-[32px]"
            stagger={0.04}
          />
          <p
            className="mt-20 max-w-520 p-body fs-16 leading-[1.6] text-p-grey-cool max-lg:mt-[18px] max-lg:max-w-none max-lg:text-[15px]"
            data-reveal="fade"
            data-reveal-delay="0.2"
          >
            {spec}
          </p>
        </div>

        {/* Bottle stack */}
        <div className="relative mx-auto mt-[40px] w-[min(86vw,420px)] lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-auto lg:-translate-1/2">
          <div
            data-stack
            className="relative aspect-[1333/2000] lg:h-[min(94svh,calc(var(--spacing)*960))]"
          >
            {/* Soft night-blue glow behind the bottle */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-x-[40%] -inset-y-[6%] bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,rgba(38,58,98,0.55),transparent_70%)]"
            />
            <div data-assembly className="absolute inset-0">
              {PARTS.map((p, i) => (
                <div
                  key={i}
                  data-part
                  aria-hidden={i > 0}
                  className={cn(
                    "absolute inset-0",
                    p.blend && "mix-blend-lighten",
                  )}
                  style={{
                    clipPath: `inset(${p.top}% 0 ${100 - p.bottom}% 0)`,
                    zIndex: p.z,
                  }}
                >
                  <Image
                    src={image.src}
                    alt={i === 0 ? image.alt : ""}
                    fill
                    sizes="(min-width: 1024px) 40vw, 86vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Leader lines + labels (desktop) */}
            <ul className="absolute inset-0 hidden lg:block">
              {hotspots.map((h, i) => {
                const p = PARTS[i];
                const left = p.side === "left";
                // Lines stop 3% short of the part: anchor the line's inner end at (50 ± (half + 3))%.
                const inset = 53 + p.half;
                return (
                  <li
                    key={h.no}
                    data-hotspot
                    className="absolute h-0"
                    style={{
                      top: `${p.cy}%`,
                      [left ? "right" : "left"]: `${inset}%`,
                      width: "calc(var(--spacing) * 300)",
                    }}
                  >
                    <span
                      data-line
                      className={cn(
                        "absolute inset-x-0 top-0 h-px bg-white/25",
                        left ? "origin-right" : "origin-left",
                      )}
                    />
                    <span
                      data-dot
                      className={cn(
                        "absolute top-0 size-7 -translate-y-1/2 rounded-full bg-p-gold-light",
                        left ? "-right-2" : "-left-2",
                      )}
                    />
                    <span
                      data-text
                      className={cn(
                        "absolute bottom-10 flex items-baseline gap-10 whitespace-nowrap",
                        left ? "left-0" : "right-0 flex-row-reverse",
                      )}
                    >
                      <span className="font-mono-p fs-13 tracking-[0.04em] text-p-gold-light/70 uppercase">
                        [+]
                      </span>
                      <span className="font-mono-p fs-13 tracking-[0.04em] text-white uppercase">
                        {h.label}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Parts list (mobile) */}
        <ul className="mt-[32px] flex flex-col gap-[16px] px-[20px] lg:hidden">
          {hotspots.map((h) => (
            <li
              key={h.no}
              className="flex items-center gap-[12px] border-b border-white/10 pb-[14px]"
            >
              <span className="p-mono text-p-gold-light">[+]</span>
              <span className="p-mono-sm text-white/45">{h.no}</span>
              <span className="p-mono text-white">{h.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
