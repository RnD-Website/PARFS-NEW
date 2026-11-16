import type { Metadata } from "next";
import Image from "next/image";
import { about } from "@/content/home";
import { PageHeader } from "@/components/content/page-header";
import { Services } from "@/components/sections/home/services";
import { Perks } from "@/components/sections/home/perks";
import { PendingContent } from "@/components/ui/pending-content";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "About us", description: "GASENOS is a modern marketplace for the things you use every day.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return (
    <>
      <div className="container-page pt-6 pb-14 lg:pt-10">
        <PageHeader eyebrow="About us" title="About GASENOS" crumbs={[{ name: "Home", href: "/" }, { name: "About", href: "/about" }]} />
        <div className="mt-10 grid items-center gap-8 lg:grid-cols-[minmax(0,620px)_1fr] lg:gap-14">
          <div className="relative aspect-[620/465] overflow-hidden rounded-[24px] border border-ink/10">
            <Image src={about.image.src} alt={about.image.alt} fill priority sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col gap-6">
            <p className="font-display text-[clamp(24px,1.5vw+16px,34px)] leading-[1.15] font-bold tracking-[-0.02em]">
              {about.lead}
              <span className="text-ink-faint">{about.rest}</span>
            </p>
            <PendingContent>Add the GASENOS story — founding, mission, team and where you operate — here.</PendingContent>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/shop" arrow>
                Shop now
              </ButtonLink>
              <ButtonLink href="/contact" variant="outline">
                Contact us
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
      <Perks />
      <Services />
    </>
  );
}
