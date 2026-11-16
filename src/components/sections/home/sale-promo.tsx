import Image from "next/image";
import Link from "next/link";
import { salePromo } from "@/content/home";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";

export function SalePromo() {
  const { images } = salePromo;
  return (
    <section aria-labelledby="sale-title" className="bg-orange py-14 lg:py-[120px]">
      <div className="container-page flex flex-col gap-10 lg:flex-row lg:gap-[60px]">
        <div className="flex flex-1 flex-col overflow-hidden rounded-[28px] bg-white px-4 pt-4 pb-7">
          <div className="relative aspect-[674/340] overflow-hidden rounded-[18px] border border-ink/10">
            <Image src={images.campaign.src} alt={images.campaign.alt} fill sizes="(min-width: 1024px) 674px, 100vw" className="object-cover" />
          </div>
          <div className="flex flex-col items-start gap-[18px] px-3 pt-6">
            <h2 id="sale-title" className="text-h3">
              {salePromo.title}
            </h2>
            <ButtonLink href={salePromo.cta.href}>{salePromo.cta.label}</ButtonLink>
          </div>
        </div>
        <div className="flex flex-1 flex-col justify-between gap-8">
          <div className="grid grid-cols-2 gap-4">
            {[images.earbuds, images.chair].map((img) => (
              <div key={img.src} className="relative aspect-[329/300] overflow-hidden rounded-[22px]">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width: 1024px) 329px, 50vw" className="object-cover" />
              </div>
            ))}
          </div>
          <ul className="flex flex-col gap-1.5">
            {salePromo.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-3.5 font-display text-[clamp(30px,2.5vw+14px,40px)] leading-[1.05] font-bold tracking-[-0.025em] text-white">
                  <span className="underline decoration-[2px] underline-offset-[5px] transition-[text-decoration-color] group-hover:decoration-transparent">{l.label}</span>
                  <Icon name="arrow-right" size={30} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
