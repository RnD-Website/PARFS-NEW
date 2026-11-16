"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { parfsFilm } from "@/content/parfs-home";

gsap.registerPlugin(ScrollTrigger);

/**
 * Brand film, between The Collection and the configurator.
 * The film opens out from an inset frame to full width as it scrolls in, plays muted on loop only while
 * on screen, and has a sound toggle. With reduced motion it doesn't autoplay — a Play button is shown instead.
 */
export function ParfsFilm() {
  const { src, poster, label, caption } = parfsFilm;
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const el = root.current;
    const v = video.current;
    if (!el || !v) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(reduced);

    // Play only while visible (saves battery / CPU), unless motion is reduced.
    const io = new IntersectionObserver(
      ([e]) => {
        if (reduced) return;
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);

    let ctx: gsap.Context | undefined;
    if (!reduced && frame.current) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          frame.current,
          { clipPath: "inset(9% 12% 9% 12%)" },
          { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 10%", scrub: 0.8 } },
        );
        gsap.fromTo(v, { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      }, el);
    }
    return () => {
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  const toggleSound = () => {
    const v = video.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (v.paused) v.play().catch(() => {});
  };
  const togglePlay = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  return (
    <section ref={root} aria-label={caption} className="relative bg-p-ink text-white">
      <div ref={frame} className="relative h-[100svh] min-h-[480px] overflow-hidden max-lg:h-[min(100svh,calc(100vw*1.25))]">
        <video
          ref={video}
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label={caption}
        />
        {/* Legibility shading for the labels */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-b from-p-ink/50 via-transparent to-p-ink/60" />

        <p className="absolute top-40 left-40 flex gap-10 p-mono max-lg:top-[24px] max-lg:left-[20px]" data-reveal="fade">
          <span className="text-white/45">{label.no}</span>
          <span>{label.text}</span>
        </p>

        <div className="absolute right-40 bottom-40 left-40 flex items-end justify-between gap-[16px] max-lg:right-[20px] max-lg:bottom-[24px] max-lg:left-[20px]">
          <p className="p-mono text-white/70">{caption}</p>
          <div className="flex gap-24 p-mono max-lg:gap-[16px]">
            {(reduce || !playing) && (
              <button type="button" onClick={togglePlay} className="text-white transition-colors hover:text-p-gold-light">
                [ {playing ? "Pause" : "Play"} ]
              </button>
            )}
            <button type="button" onClick={toggleSound} aria-pressed={!muted} className="text-p-gold-light transition-colors hover:text-white">
              [ Sound {muted ? "off" : "on"} ]
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
