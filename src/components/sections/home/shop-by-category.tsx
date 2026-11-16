import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/lib/commerce/types";
import { shopByCategory } from "@/content/home";
import { Icon } from "@/components/icons/icon";
import { SectionHeading } from "./section-heading";

/** Figma "Shop by category" + "Category Tile" (3:4 image + name). */
export function ShopByCategory({ categories }: { categories: Category[] }) {
  return (
    <section aria-labelledby="cat-title" className="pb-14 lg:pb-24">
      <div className="container-page flex items-end justify-between gap-6">
        <SectionHeading id="cat-title" eyebrow={shopByCategory.eyebrow} title={shopByCategory.title} />
        <Link href={shopByCategory.link.href} className="group hidden shrink-0 items-center gap-1 text-[13px] font-semibold whitespace-nowrap sm:flex">
          <span className="underline-offset-4 group-hover:underline">{shopByCategory.link.label}</span> →
        </Link>
      </div>
      <ul className="no-scrollbar container-page mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 md:grid md:grid-cols-3 md:overflow-visible lg:grid-cols-6">
        {categories.map((c) => (
          <li key={c.slug} className="w-[44%] shrink-0 snap-start sm:w-[30%] md:w-auto">
            <Link href={`/shop/${c.slug}`} className="group flex flex-col gap-3.5">
              <span className="relative aspect-[227/266] overflow-hidden rounded-[var(--radius-card)] border border-ink/10 bg-image">
                {c.image && (
                  <Image
                    src={c.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 227px, (min-width: 768px) 30vw, 44vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                )}
              </span>
              <span className="flex items-center justify-between">
                <span className="text-h4">{c.name}</span>
                <Icon name="arrow-up-right" size={20} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="container-page mt-6 sm:hidden">
        <Link href={shopByCategory.link.href} className="text-[14px] font-semibold underline underline-offset-4">
          {shopByCategory.link.label} →
        </Link>
      </div>
    </section>
  );
}
