import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/content/page-header";
import { Icon, type IconName } from "@/components/icons/icon";
import { helpTopics, policies } from "@/content/policies";

export const metadata: Metadata = { title: "Help centre", alternates: { canonical: "/help" } };

const quick: { title: string; text: string; href: string; icon: IconName }[] = [
  { title: "Track an order", text: "See where your parcel is.", href: "/track-order", icon: "truck" },
  { title: "Ask GASENOS AI", text: "Instant answers, any time.", href: "/assistant", icon: "sparkles" },
  { title: "FAQ", text: "Delivery, returns, payment.", href: "/faq", icon: "info" },
  { title: "Contact us", text: "Talk to a real person.", href: "/contact", icon: "support" },
];

export default function HelpPage() {
  return (
    <div className="container-page pt-6 pb-16 lg:pt-10 lg:pb-24">
      <PageHeader eyebrow="Help" title="How can we help?" crumbs={[{ name: "Home", href: "/" }, { name: "Help", href: "/help" }]} />
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => (
          <li key={q.href}>
            <Link href={q.href} className="flex h-full flex-col gap-3 rounded-[24px] border border-line bg-card p-6 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-ink/30">
              <span className="flex size-12 items-center justify-center rounded-full bg-image">
                <Icon name={q.icon} size={22} />
              </span>
              <span className="text-h4">{q.title}</span>
              <span className="text-body-sm text-ink-muted">{q.text}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <section aria-labelledby="policies">
          <h2 id="policies" className="text-h3">
            Policies
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {policies.map((p) => (
              <li key={p.slug}>
                <Link href={`/policies/${p.slug}`} className="flex items-center justify-between py-4 text-body font-semibold hover:text-orange-text">
                  {p.title} <Icon name="chevron-right" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="services">
          <h2 id="services" className="text-h3">
            Services
          </h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {helpTopics.map((t) => (
              <li key={t.slug}>
                <Link href={`/help/${t.slug}`} className="flex items-center justify-between py-4 text-body font-semibold hover:text-orange-text">
                  {t.title} <Icon name="chevron-right" size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
