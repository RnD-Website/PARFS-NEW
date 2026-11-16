"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type Props = { src: string; alt: string; sizes: string };

/**
 * The hero bottle of the PARFS (Nocturne) section, brought to life:
 *  • floats gently up and down with a slight sway, its shadow on the "floor" breathing with it,
 *  • a soft band of light sweeps across the glass every few seconds (masked to the bottle's shape),
 *  • tilts a few degrees towards the pointer in 3D (desktop),
 * on top of the existing scroll parallax and reveal. All motion stops for prefers-reduced-motion.
 */
export function BottleShowcase({ src, alt, sizes }: Props) {
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = tilt.current;
    const zone = el?.closest("section");
    if (!el || !zone) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `perspective(1200px) rotateY(${cx}deg) rotateX(${cy}deg)`;
      raf = Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01 ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2);
      const ny = (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2);
      tx = Math.max(-1, Math.min(1, nx)) * 9;
      ty = Math.max(-1, Math.min(1, ny)) * -6;
      kick();
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      kick();
    };
    zone.addEventListener("pointermove", onMove);
    zone.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      zone.removeEventListener("pointermove", onMove);
      zone.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const mask = {
    maskImage: `url(${src})`,
    WebkitMaskImage: `url(${src})`,
    maskSize: "contain",
    WebkitMaskSize: "contain",
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
  } as const;

  return (
    <>
      {/* Floor shadow — shrinks and fades as the bottle rises */}
      <div
        aria-hidden
        className="absolute -bottom-[5%] left-1/2 h-[7%] w-[62%] animate-[p-float-shadow_6s_ease-in-out_infinite] rounded-[50%] bg-[radial-gradient(closest-side,rgba(64,51,31,0.32),transparent)] blur-[6px]"
      />
      <div ref={tilt} className="absolute inset-0 will-change-transform [transform-style:preserve-3d]">
        <div className="absolute inset-0 animate-[p-float_6s_ease-in-out_infinite]">
          <Image src={src} alt={alt} fill sizes={sizes} className="object-contain drop-shadow-[0_30px_30px_rgba(64,51,31,0.18)]" />
          {/* Light sweep, clipped to the bottle silhouette */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden mix-blend-soft-light" style={mask}>
            <div className="absolute inset-y-[-20%] left-0 w-[45%] animate-[p-sheen_5.5s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-[linear-gradient(100deg,transparent_0%,rgba(255,255,255,0.0)_20%,rgba(255,255,255,0.85)_50%,rgba(255,255,255,0)_80%,transparent_100%)]" />
          </div>
        </div>
      </div>
    </>
  );
}
