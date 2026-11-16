import Image from "next/image";
import { about } from "@/content/home";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button";

export function About() {
  return (
    <section aria-labelledby="about-title" className="container-page py-14 lg:py-24">
      <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-14">
        <div className="relative aspect-[620/465] w-full overflow-hidden rounded-[24px] border border-ink/10 lg:w-[43%] lg:max-w-[620px] lg:shrink-0">
          <div className="absolute inset-0 origin-[50%_10%] animate-ken-burns will-change-transform">
            <Image src={about.image.src} alt={about.image.alt} fill sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
          </div>
          {/* Drifting warm light */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-1/2 inset-y-0 animate-light-drift bg-[linear-gradient(100deg,transparent_30%,rgba(255,214,150,0.45)_45%,rgba(255,236,200,0.25)_52%,transparent_68%)] mix-blend-soft-light will-change-transform"
          />
        </div>
        <div className="flex flex-1 flex-col items-start gap-6">
          <Eyebrow>{about.eyebrow.toUpperCase()}</Eyebrow>
          <h2 id="about-title" className="font-display text-[clamp(24px,1.5vw+16px,34px)] leading-[1.15] font-bold tracking-[-0.02em]">
            {about.lead}
            <span className="text-ink-faint">{about.rest}</span>
          </h2>
          <ButtonLink href={about.cta.href}>{about.cta.label}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
