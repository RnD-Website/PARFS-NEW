import Link from "next/link";
import { tickerCategories } from "@/content/home";

/** Figma "Category ticker" — six equal cells; horizontally scrollable on small screens. */
export function CategoryTicker() {
  return (
    <nav aria-label="Shop by category" className="border-b border-line bg-cream">
      <ul className="no-scrollbar flex snap-x overflow-x-auto">
        {tickerCategories.map((c, i) => (
          <li key={c.href} className={`flex min-w-[42%] flex-1 snap-start sm:min-w-[28%] lg:min-w-0 ${i < tickerCategories.length - 1 ? "border-r border-line" : ""}`}>
            <Link
              href={c.href}
              className="group flex h-16 w-full items-center justify-center font-display text-[22px] leading-[1.15] font-extrabold tracking-[-0.02em] whitespace-nowrap transition-colors duration-300 hover:bg-orange hover:text-white lg:h-[88px] lg:text-[28px]"
            >
              <span className="transition-transform duration-300 group-hover:-translate-y-0.5">{c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
