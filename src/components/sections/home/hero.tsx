import Image from "next/image";
import Link from "next/link";
import { hero } from "@/content/home";
import type { ProductSummary } from "@/lib/commerce/types";
import { ButtonLink } from "@/components/ui/button";
import { formatMoney } from "@/lib/utils/money";

/**
 * Hero (Figma "Hero stage"). ≥ lg: the 1440×770 composition with the giant wordmark,
 * sneaker overlapping it, copy bottom-left and cards bottom-right — positions are
 * proportional so it holds from 1024px up. < lg: stacked layout.
 */
export function Hero({ floating }: { floating: ProductSummary | null }) {
  return (
    <section aria-labelledby="hero-title" className="overflow-hidden bg-orange text-white">
      <div className="container-page">
        {/* Always exactly one screen tall, minus the header (min 600px on desktop so nothing collides) */}
        <div className="@container relative flex min-h-[calc(100svh-var(--header-h))] flex-col justify-center pb-10 lg:block lg:h-[calc(100svh-var(--header-h))] lg:min-h-[600px] lg:pb-0">
          {/* Giant wordmark (decorative; the h1 is the headline below) */}
          <p
            aria-hidden
            className="pointer-events-none relative z-0 flex justify-center pt-4 font-display text-[20.1cqw] leading-[0.8] font-black tracking-[-0.06em] whitespace-nowrap select-none lg:absolute lg:inset-x-0 lg:top-[5.06%] lg:pt-0"
          >
            GASENOS
          </p>

          {/* Sneaker */}
          <div className="relative z-10 mx-auto -mt-[16cqw] aspect-[659/715] w-[82%] max-w-[520px] lg:absolute lg:top-[-1.95%] lg:left-[max(28.75%,416px)] lg:mt-0 lg:w-[min(45.76%,calc(100%-560px),calc((100svh-var(--header-h))*0.92))] lg:max-w-none">
            <div className="relative size-full animate-sneaker-float will-change-transform">
            <Image
              src="/images/hero/hero-sneaker.png"
              alt="Aero Runner X sneaker in white knit with Volt Orange accents"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 82vw"
              className="object-contain drop-shadow-[0_30px_40px_rgba(28,26,23,0.18)]"
            />
            </div>
          </div>

          {/* Copy */}
          <div className="relative z-20 mt-2 flex max-w-[400px] flex-col gap-6 lg:absolute lg:bottom-[9.09%] lg:left-0 lg:mt-0">
            <div className="flex flex-col gap-[18px]">
              <h1 id="hero-title" className="font-display text-[clamp(32px,3vw+18px,40px)] leading-[1.05] font-extrabold tracking-[-0.025em]">
                {hero.headline[0]}
                <br />
                {hero.headline[1]}
              </h1>
              <p className="text-body">{hero.subtext}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={hero.primaryCta.href} variant="light" arrow>
                {hero.primaryCta.label}
              </ButtonLink>
              <ButtonLink href={hero.secondaryCta.href} variant="outline-light">
                {hero.secondaryCta.label}
              </ButtonLink>
            </div>
          </div>

          {/* Cards */}
          <div className="no-scrollbar relative z-20 -mx-4 mt-8 flex snap-x snap-mandatory items-end gap-4 overflow-x-auto px-4 pb-1 sm:-mx-8 sm:px-8 md:mx-0 md:overflow-visible md:px-0 lg:absolute lg:right-0 lg:bottom-[9.09%] lg:mt-0 lg:flex-col lg:items-end lg:gap-6">
            {floating && (
              <Link
                href={`/products/${floating.slug}`}
                className="group flex w-[326px] shrink-0 snap-start items-center gap-3.5 rounded-[20px] bg-white py-3 pr-[18px] pl-3 text-ink shadow-[0_16px_40px_rgba(28,26,23,0.12)] transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="relative size-[92px] shrink-0 overflow-hidden rounded-[14px] border border-ink/10">
                  <Image src="/images/hero/floating-card-headphones.png" alt={floating.name} fill sizes="92px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-2">
                  <span className="flex flex-col gap-1">
                    <span className="text-caption text-ink-muted">{hero.floatingProductLabel}</span>
                    <span className="text-label">{floating.name}</span>
                  </span>
                  <span className="flex items-center justify-between">
                    <span className="text-price tabular-nums">{formatMoney(floating.price, floating.currency)}</span>
                    <span className="text-body-sm font-semibold text-orange-text transition-transform group-hover:translate-x-0.5">View →</span>
                  </span>
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
