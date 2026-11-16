import Image from "next/image";
import Link from "next/link";
import { footerNav, site } from "@/content/site";

/**
 * Footer (Figma "Footer"). Payment marks reflect the methods GASENOS actually accepts
 * (cards via SSLCommerz, bKash, Nagad, COD) rather than the EU logos in the mockup.
 */
const cardLogos = [
  { src: "/images/payments/visa.png", alt: "Visa" },
  { src: "/images/payments/mastercard.png", alt: "Mastercard" },
  { src: "/images/payments/amex.png", alt: "American Express" },
];
const textMethods = ["bKash", "Nagad", "Cash on delivery"];

const heading = "mb-4 text-caption font-semibold tracking-normal text-orange-soft uppercase";
const link = "text-body-sm text-cream transition-colors hover:text-white hover:underline underline-offset-4";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="overflow-hidden bg-dark pt-16 pb-24 text-cream md:pb-6 lg:pt-[120px]">
      <div className="container-page flex flex-col gap-14 lg:gap-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <h2 className={heading}>Contact</h2>
            <ul className="flex flex-col gap-2.5 text-body-sm">
              <li>{site.contact.address}</li>
              <li>{site.contact.email}</li>
              <li>{site.contact.phone}</li>
              <li>
                <Link href="/contact" className={link}>
                  Contact form
                </Link>
              </li>
            </ul>
          </div>
          <nav aria-label="Shop">
            <h2 className={heading}>Shop</h2>
            <ul className="flex flex-col gap-2.5">
              {footerNav.shop.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Help">
            <h2 className={heading}>Help</h2>
            <ul className="flex flex-col gap-2.5">
              {footerNav.help.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className={link}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/faq" className={link}>
                  FAQ
                </Link>
              </li>
            </ul>
          </nav>
          <div>
            <h2 className={heading}>Social</h2>
            <ul className="flex flex-col gap-2.5">
              {site.social.map((s) => (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-body-sm text-white underline underline-offset-4 hover:text-orange-soft">
                      {s.label}
                    </a>
                  ) : (
                    <span className="text-body-sm text-white underline underline-offset-4" title="Link coming soon">
                      {s.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-8 lg:gap-10">
          <div className="flex flex-col-reverse items-start justify-between gap-5 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-caption text-dark-muted">
              <p>
                © {year} {site.legalName}. All rights reserved.
              </p>
              {footerNav.legal.map((l) => (
                <Link key={l.href} href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              ))}
            </div>
            <ul className="flex flex-wrap items-center gap-1" aria-label="Accepted payment methods">
              {cardLogos.map((l) => (
                <li key={l.alt}>
                  <Image src={l.src} alt={l.alt} width={38} height={24} className="h-6 w-[38px]" />
                </li>
              ))}
              {textMethods.map((m) => (
                <li key={m} className="flex h-6 items-center rounded-[4px] bg-white px-2 text-[11px] font-bold text-ink">
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <p
            aria-hidden
            className="bg-gradient-to-b from-white/10 to-white/0 bg-clip-text text-center font-display text-[17.6vw] leading-[0.8] font-black tracking-[-0.06em] text-transparent select-none 2xl:text-[283px]"
          >
            GASENOS
          </p>
        </div>
      </div>
    </footer>
  );
}
