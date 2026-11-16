import { parfsHero } from "@/content/parfs-home";
import { ParfsButton } from "../ui/parfs-button";
import { HeroSlides } from "./hero-slides";

/** Figma: Hero — triptych (1440×900). Three image panels split by 2px gutters, auto-sliding. */
export function ParfsHero() {
  const { panels, cta } = parfsHero;
  // Order matters: slide 01 shows left · centre · right exactly as designed.
  const slides = [panels.left, panels.center, panels.right];

  return (
    <section
      aria-label="PARFS — Nocturne, the new collection"
      data-parallax-root
      className="relative h-[100svh] min-h-[600px] overflow-hidden bg-p-ink lg:h-[max(100svh,calc(var(--spacing)*720))]"
    >
      <HeroSlides
        slides={slides}
        counterClassName="absolute right-40 bottom-46 z-20 flex items-center gap-14 p-mono max-lg:right-[20px] max-lg:bottom-[32px]"
      />

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-180 bg-gradient-to-b from-black/60 to-transparent max-lg:h-[180px]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-300 bg-gradient-to-b from-transparent to-black/70 max-lg:h-[340px]" />

      {/* CTA — horizontally centred on the page */}
      <div className="absolute bottom-64 left-1/2 -translate-x-1/2 max-lg:bottom-[84px]" data-reveal="fade" data-reveal-now data-reveal-delay="1.2">
        <ParfsButton href={cta.href}>{cta.label}</ParfsButton>
      </div>

      {/* Scroll cue */}
      <a
        href="#maison"
        className="absolute bottom-46 left-40 p-mono text-white/60 transition-colors hover:text-white max-lg:bottom-[32px] max-lg:left-[20px]"
        data-reveal="fade"
        data-reveal-now
        data-reveal-delay="1.4"
        data-reveal-y="0"
      >
        <span className="inline-block animate-[p-bob_2.4s_ease-in-out_infinite]">[ Scroll ]</span>
      </a>
    </section>
  );
}
