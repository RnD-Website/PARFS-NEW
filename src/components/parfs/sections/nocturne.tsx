import Link from "next/link";
import { parfsNocturne } from "@/content/parfs-home";
import { SplitText } from "../motion/split-text";
import { IngredientCarousel } from "./ingredient-carousel";
import { BottleShowcase } from "./bottle-showcase";

/** Figma: Nocturne — signature & ingredients (1440×1240). */
export function ParfsNocturne() {
  const { word, bottle, links, ingredients, caption } = parfsNocturne;

  return (
    <section id="maison" aria-label="Nocturne — signature and ingredients" data-parallax-root className="relative overflow-hidden bg-p-sand text-p-text lg:h-1260">
      {/* Giant word */}
      <SplitText
        as="h2"
        lines={word}
        className="relative pl-[0.06em] text-center font-italiana fs-360 leading-none tracking-[0.06em] whitespace-nowrap text-p-gold max-lg:pt-[104px] max-lg:text-[26vw] lg:absolute lg:top-90 lg:left-1/2 lg:-translate-x-1/2 lg:leading-[normal]"
        stagger={0.05}
      />

      {/* Bottle (transparent cut-out), floating in front of the word */}
      <div className="relative z-10 mx-auto aspect-[762/804] w-[82%] max-w-[420px] max-lg:-mt-[10vw] lg:absolute lg:top-265 lg:left-440 lg:mt-0 lg:w-560 lg:max-w-none">
        <div className="absolute inset-0" data-speed="-0.18">
          <div className="absolute inset-0" data-reveal="fade" data-reveal-y="80">
            <BottleShowcase src={bottle.src} alt={bottle.alt} sizes="(min-width: 1024px) 39vw, 82vw" />
          </div>
        </div>
      </div>

      {/* Product links */}
      <div className="relative mt-[24px] flex flex-col gap-[28px] px-[20px] lg:contents">
        {links.map((l, i) => (
          <Link
            key={l.name}
            href={l.href}
            className={`group flex w-full flex-col gap-10 lg:absolute lg:top-620 lg:w-220 ${i === 0 ? "lg:left-170" : "lg:left-1050"}`}
            data-reveal="fade"
            data-reveal-delay={0.15 + i * 0.1}
          >
            <span className="p-mono-sm text-p-grey">{l.tag}</span>
            <span className="fs-13 font-medium tracking-[0.16em] whitespace-nowrap text-p-gold uppercase max-lg:text-[13px]">{l.name}</span>
            <span className="relative h-px w-full overflow-hidden bg-p-gold/60">
              <span className="absolute inset-0 -translate-x-full bg-p-gold transition-transform duration-700 ease-out-expo group-hover:translate-x-0" />
            </span>
          </Link>
        ))}
      </div>

      <div className="relative mt-[64px] lg:absolute lg:top-920 lg:right-0 lg:left-0 lg:mt-0">
        <IngredientCarousel items={ingredients} />
      </div>

      <p className="relative pt-[24px] pb-[48px] text-center p-mono text-p-grey lg:absolute lg:top-1178 lg:left-1/2 lg:-translate-x-1/2 lg:py-0 lg:whitespace-nowrap" data-reveal="fade">
        {caption}
      </p>
    </section>
  );
}
