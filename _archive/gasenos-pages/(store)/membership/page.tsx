import type { Metadata } from "next";
import { PageHeader } from "@/components/content/page-header";
import { Perks } from "@/components/sections/home/perks";
import { Newsletter } from "@/components/sections/home/newsletter";
import { Icon, type IconName } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Membership & perks", description: "Free delivery, easy returns, secure payment and GASENOS AI — plus members-only deals.", alternates: { canonical: "/membership" } };

const benefits: { icon: IconName; title: string; text: string }[] = [
  { icon: "package", title: "Track every order", text: "See every order and its delivery progress in one place." },
  { icon: "location", title: "Faster checkout", text: "Save addresses and check out in a few taps." },
  { icon: "heart", title: "Wishlist everywhere", text: "Your saved items follow you to every device." },
  { icon: "sparkles", title: "Smarter AI picks", text: "GASENOS AI can look up your orders and recommend sizes." },
];

export default function MembershipPage() {
  return (
    <>
      <div className="container-page pt-6 pb-14 lg:pt-10">
        <PageHeader
          eyebrow="Membership"
          title="Perks for every GASENOS shopper"
          intro="Create a free account to unlock faster checkout and order tracking, and join the list for members-only deals."
          crumbs={[{ name: "Home", href: "/" }, { name: "Membership", href: "/membership" }]}
        />
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <li key={b.title} className="flex flex-col gap-3 rounded-[24px] bg-card p-6">
              <span className="flex size-12 items-center justify-center rounded-full bg-image">
                <Icon name={b.icon} size={22} />
              </span>
              <span className="text-h4">{b.title}</span>
              <span className="text-body-sm text-ink-muted">{b.text}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/account/register" arrow>
            Create a free account
          </ButtonLink>
          <ButtonLink href="/account/login" variant="outline">
            Sign in
          </ButtonLink>
        </div>
      </div>
      <Perks />
      <Newsletter />
    </>
  );
}
