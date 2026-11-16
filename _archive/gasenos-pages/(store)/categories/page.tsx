import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { commerce } from "@/lib/commerce";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/icons/icon";
import { Breadcrumbs } from "@/components/catalog/breadcrumbs";
import { pluralize } from "@/lib/utils/format";

export const metadata: Metadata = { title: "All categories", alternates: { canonical: "/categories" } };
export const revalidate = 300;

export default async function CategoriesPage() {
  const categories = await commerce.getCategories();
  return (
    <div className="container-page pt-6 pb-16 lg:pt-10 lg:pb-24">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Categories", href: "/categories" }]} />
      <header className="mt-6 flex flex-col gap-3.5 lg:mt-8">
        <Eyebrow>SHOP BY CATEGORY</Eyebrow>
        <h1 className="text-h1">Find your next favourite</h1>
      </header>
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:gap-x-6">
        {categories.map((c) => (
          <li key={c.slug}>
            <Link href={`/shop/${c.slug}`} className="group flex flex-col gap-3.5">
              <span className="relative aspect-[227/266] overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-image">
                {c.image && <Image src={c.image} alt="" fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />}
              </span>
              <span className="flex items-center justify-between gap-2">
                <span>
                  <span className="block text-h3">{c.name}</span>
                  <span className="text-body-sm text-ink-muted">{pluralize(c.productCount ?? 0, "product")}</span>
                </span>
                <Icon name="arrow-up-right" size={24} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
