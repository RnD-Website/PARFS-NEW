"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { catalogConcentrations, catalogFamilies, collectionPage, type CatalogItem, type Concentration, type Family } from "@/content/parfs-catalog";
import { cn } from "@/lib/utils/cn";
import { scrollToTarget, setScrollLocked } from "../motion/smooth-scroll";
import { WishlistHeart } from "../wishlist/wishlist-heart";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
type PriceBand = "all" | "under-160" | "160-190" | "over-190";

const SORTS: { value: Sort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "name", label: "Name, A–Z" },
];
const PRICES: { value: PriceBand; label: string; test: (p: number) => boolean }[] = [
  { value: "all", label: "All prices", test: () => true },
  { value: "under-160", label: "Under $160", test: (p) => p < 160 },
  { value: "160-190", label: "$160 – $190", test: (p) => p >= 160 && p <= 190 },
  { value: "over-190", label: "Over $190", test: (p) => p > 190 },
];
/** Index (within each page) of the product shown as a large 2×2 feature tile on desktop. */
const FEATURE_INDEX = 5;
/**
 * Products per page. With the editorial tiles a full page is 16 cards + one 2×2 feature + two 2-wide
 * campaign tiles = 24 cells = exactly 6 rows of 4, so the grid never ends with a hole. Filtered/sorted
 * results drop the editorial tiles, so they page by 16 (4 full rows).
 */
const PAGE_SIZE_EDITORIAL = 17;
const PAGE_SIZE_PLAIN = 16;

/**
 * PARFS collection — modelled on étoile.com/collections/all:
 * title + intro with "Read more", a toolbar (Filter & Sort · count · Product / Campaign view),
 * a 4-up grid broken by a large feature tile and wide campaign tiles, and a slide-in filter drawer.
 */
export function CollectionView({ items, initialPage = 1 }: { items: CatalogItem[]; initialPage?: number }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [view, setView] = useState<"product" | "campaign">("product");
  const [sort, setSort] = useState<Sort>("featured");
  const [families, setFamilies] = useState<Family[]>([]);
  const [concs, setConcs] = useState<Concentration[]>([]);
  const [price, setPrice] = useState<PriceBand>("all");
  const gridTop = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const band = PRICES.find((p) => p.value === price)!;
    const list = items.filter(
      (it) => (!families.length || families.includes(it.family)) && (!concs.length || concs.includes(it.concentration)) && band.test(it.price),
    );
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, families, concs, price, sort]);

  const activeCount = families.length + concs.length + (price !== "all" ? 1 : 0) + (sort !== "featured" ? 1 : 0);
  // Editorial tiles only make sense in the untouched, featured order.
  const editorial = activeCount === 0;
  const clear = () => {
    setFamilies([]);
    setConcs([]);
    setPrice("all");
    setSort("featured");
  };
  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  // The page number belongs to one filter/sort combination: change the filters and you're back on page 1.
  const filterKey = `${sort}|${families.join()}|${concs.join()}|${price}`;
  const [paging, setPaging] = useState({ key: filterKey, page: initialPage });
  const page = paging.key === filterKey ? paging.page : 1;

  const pageSize = editorial ? PAGE_SIZE_EDITORIAL : PAGE_SIZE_PLAIN;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const start = (current - 1) * pageSize;
  const pageItems = filtered.slice(start, start + pageSize);

  // Keep the page number in the URL (?page=2) so a page can be shared or reloaded.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (current > 1) url.searchParams.set("page", String(current));
    else url.searchParams.delete("page");
    window.history.replaceState(window.history.state, "", url);
  }, [current]);

  const goTo = (n: number) => {
    if (n < 1 || n > pageCount || n === current) return;
    setPaging({ key: filterKey, page: n });
    if (gridTop.current) scrollToTarget(gridTop.current.getBoundingClientRect().top + window.scrollY - 72);
  };

  useEffect(() => {
    setScrollLocked(drawer);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    if (drawer) window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (drawer) setScrollLocked(false);
    };
  }, [drawer]);

  // Changing filters replays the card entrance.
  const gridKey = `${filterKey}|${view}|${current}`;

  return (
    <section className="bg-p-paper text-p-text">
      {/* Head */}
      <div className="mx-auto max-w-[1920px] px-40 pt-128 pb-36 max-lg:px-[20px] max-lg:pt-[96px] max-lg:pb-[28px]">
        <h1 className="font-italiana fs-72 leading-[1] max-lg:mt-[12px] max-lg:text-[44px]" data-reveal="fade" data-reveal-now data-reveal-delay="0.1">
          {collectionPage.title}
        </h1>
        <div className="mt-16 max-w-640 p-body fs-17 leading-[1.55] text-p-text/80 max-lg:mt-[14px] max-lg:text-[16px]" data-reveal="fade" data-reveal-now data-reveal-delay="0.2">
          <p>
            {collectionPage.intro}{" "}
            {!moreOpen && (
              <button type="button" onClick={() => setMoreOpen(true)} className="text-p-text underline underline-offset-4">
                Read more
              </button>
            )}
          </p>
          <div className={cn("grid transition-[grid-template-rows] duration-500 ease-out-expo", moreOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden">
              <p className="pt-10 max-lg:pt-[8px]">
                {collectionPage.more}{" "}
                <button type="button" onClick={() => setMoreOpen(false)} className="text-p-text underline underline-offset-4">
                  Read less
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div ref={gridTop} className="mx-auto max-w-[1920px] px-40 max-lg:px-[20px]">
        <div className="flex items-center justify-between border-y border-p-text/12 py-14 max-lg:py-[12px]">
          <button type="button" onClick={() => setDrawer(true)} className="flex items-center gap-8 p-mono max-lg:gap-[8px]" aria-haspopup="dialog">
            <span aria-hidden>+</span> Filter &amp; Sort
            {activeCount > 0 && <span className="flex size-18 items-center justify-center rounded-full bg-p-text fs-10 text-p-paper max-lg:size-[18px] max-lg:text-[10px]">{activeCount}</span>}
          </button>
          <p className="p-mono text-p-grey max-md:hidden" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"}
          </p>
          <div className="flex gap-6 p-mono" role="group" aria-label="View">
            {(["product", "campaign"] as const).map((v, i) => (
              <Fragment key={v}>
                {i > 0 && <span className="text-p-grey">/</span>}
                <button type="button" onClick={() => setView(v)} aria-pressed={view === v} className={cn("capitalize transition-colors", view === v ? "text-p-text" : "text-p-grey hover:text-p-text")}>
                  {v}
                </button>
              </Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-[1920px] px-40 pt-24 pb-120 max-lg:px-[20px] max-lg:pt-[16px] max-lg:pb-[80px]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-16 py-120 text-center">
            <p className="font-italiana fs-40">No fragrances match</p>
            <button type="button" onClick={clear} className="p-mono underline underline-offset-4">
              Clear filters
            </button>
          </div>
        ) : (
          <ul key={gridKey} className="grid grid-flow-dense grid-cols-4 gap-16 max-lg:grid-cols-2 max-lg:gap-[12px]">
            {pageItems.map((it, i) => {
              const campaign = editorial ? collectionPage.campaigns.find((c) => c.page === current && c.after === i) : undefined;
              const feature = editorial && i === FEATURE_INDEX;
              return (
                <Fragment key={it.slug}>
                  {campaign && <CampaignTile {...campaign} delay={i} />}
                  <ProductCard item={it} view={view} feature={feature} delay={i} />
                </Fragment>
              );
            })}
          </ul>
        )}

        {pageCount > 1 && (
          <Pagination current={current} count={pageCount} from={start + 1} to={start + pageItems.length} total={filtered.length} onChange={goTo} />
        )}
      </div>

      {/* Filter drawer */}
      <div className={cn("fixed inset-0 z-[60] transition-[visibility] duration-700", drawer ? "visible" : "invisible")} aria-hidden={!drawer}>
        <div onClick={() => setDrawer(false)} className={cn("absolute inset-0 bg-p-ink/40 backdrop-blur-[2px] transition-opacity duration-500", drawer ? "opacity-100" : "opacity-0")} />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Filter and sort"
          data-lenis-prevent
          className={cn(
            "absolute inset-y-0 left-0 flex w-440 max-w-full flex-col bg-p-paper text-p-text shadow-2xl transition-transform duration-700 ease-out-expo max-lg:w-[min(92vw,420px)]",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between border-b border-p-text/12 px-28 py-20 max-lg:px-[20px] max-lg:py-[18px]">
            <p className="p-mono">Filter &amp; Sort</p>
            <button type="button" onClick={() => setDrawer(false)} className="p-mono text-p-grey hover:text-p-text" aria-label="Close filters">
              Close ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-28 py-8 max-lg:px-[20px]">
            <FilterGroup title="Sort by">
              {SORTS.map((s) => (
                <Choice key={s.value} type="radio" name="sort" checked={sort === s.value} onChange={() => setSort(s.value)} label={s.label} />
              ))}
            </FilterGroup>
            <FilterGroup title="Scent family">
              {catalogFamilies.map((f) => (
                <Choice key={f} type="checkbox" checked={families.includes(f)} onChange={() => toggle(families, f, setFamilies)} label={f} count={items.filter((x) => x.family === f).length} />
              ))}
            </FilterGroup>
            <FilterGroup title="Concentration">
              {catalogConcentrations.map((c) => (
                <Choice key={c} type="checkbox" checked={concs.includes(c)} onChange={() => toggle(concs, c, setConcs)} label={c} count={items.filter((x) => x.concentration === c).length} />
              ))}
            </FilterGroup>
            <FilterGroup title="Price">
              {PRICES.map((p) => (
                <Choice key={p.value} type="radio" name="price" checked={price === p.value} onChange={() => setPrice(p.value)} label={p.label} />
              ))}
            </FilterGroup>
          </div>
          <div className="flex gap-12 border-t border-p-text/12 px-28 py-20 max-lg:gap-[12px] max-lg:px-[20px] max-lg:py-[16px]">
            <button type="button" onClick={clear} className="flex-1 border border-p-text/30 py-14 p-mono transition-colors hover:border-p-text max-lg:py-[14px]">
              Clear all
            </button>
            <button type="button" onClick={() => setDrawer(false)} className="flex-[1.4] bg-p-text py-14 p-mono text-p-paper transition-opacity hover:opacity-90 max-lg:py-[14px]">
              Show {filtered.length} {filtered.length === 1 ? "result" : "results"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ProductCard({ item, view, feature, delay }: { item: CatalogItem; view: "product" | "campaign"; feature: boolean; delay: number }) {
  const primary = view === "campaign" ? item.hover : item.image;
  const secondary = view === "campaign" ? item.image : item.hover;
  return (
    <li
      className={cn("group relative animate-[p-card-in_0.8s_cubic-bezier(0.16,1,0.3,1)_both]", feature && "col-span-2 row-span-2 max-lg:row-span-1 lg:col-start-3")}
      style={{ animationDelay: `${Math.min(delay, 10) * 60}ms` }}
    >
      <Link href={`/products/${item.slug}`} className="flex h-full flex-col">
        <div className={cn("relative overflow-hidden bg-p-sand", feature ? "aspect-[4/5] lg:aspect-auto lg:flex-1" : "aspect-[4/5]")}>
          <Image src={primary} alt={item.imageAlt} fill sizes={feature ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"} className="object-cover transition-[opacity,transform] duration-[1.2s] ease-out-expo group-hover:scale-[1.03]" />
          <Image src={secondary} alt="" fill sizes={feature ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 24vw, 50vw"} className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          {item.tag && <span className="absolute top-12 left-12 rounded-full bg-p-ink/25 px-12 py-6 p-mono-sm text-white backdrop-blur-md max-lg:top-[10px] max-lg:left-[10px] max-lg:px-[10px] max-lg:py-[5px]">{item.tag}</span>}
        </div>
        <div className="flex items-start justify-between gap-12 pt-12 max-lg:gap-[10px] max-lg:pt-[10px]">
          <div className="min-w-0">
            <h2 className={cn("font-italiana leading-[1.1]", feature ? "fs-32 max-lg:text-[24px]" : "fs-24 max-lg:text-[20px]")}>{item.name}</h2>
            <p className="mt-4 p-mono-sm text-p-grey max-lg:mt-[4px]">
              {item.concentration} · {item.volume}
            </p>
            <p className="mt-4 truncate p-body fs-14 text-p-text/70 max-lg:mt-[4px] max-lg:text-[13px]">{item.notes}</p>
          </div>
          <span className="shrink-0 p-body fs-16 font-medium max-lg:text-[15px]">${item.price}</span>
        </div>
      </Link>
      <WishlistHeart slug={item.slug} name={item.name} tone="light" className="absolute top-12 right-12 z-10 max-lg:top-[10px] max-lg:right-[10px]" />
    </li>
  );
}

function CampaignTile({ image, alt, title, cta, href, delay }: { image: string; alt: string; title: string; cta: string; href: string; delay: number }) {
  return (
    <li className="col-span-2 animate-[p-card-in_0.8s_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: `${Math.min(delay, 10) * 60}ms` }}>
      <Link href={href} className="group relative block aspect-[4/3] overflow-hidden bg-p-ink lg:aspect-auto lg:h-full lg:min-h-[calc(var(--spacing)*420)]">
        <Image src={image} alt={alt} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover transition-transform duration-[1.6s] ease-out-expo group-hover:scale-[1.04]" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-6 p-24 text-white max-lg:gap-[6px] max-lg:p-[18px]">
          <p className="font-italiana fs-40 leading-none max-lg:text-[28px]">{title}</p>
          <p className="p-mono">
            <span className="p-underline">{cta}</span> →
          </p>
        </div>
      </Link>
    </li>
  );
}

function Pagination({ current, count, from, to, total, onChange }: { current: number; count: number; from: number; to: number; total: number; onChange: (n: number) => void }) {
  const pages = Array.from({ length: count }, (_, i) => i + 1);
  const arrow = "flex items-center gap-8 p-mono transition-opacity disabled:pointer-events-none disabled:opacity-30 max-lg:gap-[8px]";
  return (
    <nav aria-label={`Pagination — showing ${from}–${to} of ${total}`} className="mt-72 flex flex-col items-center border-t border-p-text/12 pt-36 max-lg:mt-[48px] max-lg:pt-[28px]">
      <div className="flex w-full items-center justify-between">
        <button type="button" onClick={() => onChange(current - 1)} disabled={current === 1} className={cn(arrow, "group")}>
          <span aria-hidden className="transition-transform duration-500 group-hover:-translate-x-4">←</span>
          <span className="p-underline">Previous</span>
        </button>
        <ol className="flex items-center gap-8 max-lg:gap-[6px]">
          {pages.map((n) => (
            <li key={n}>
              <button
                type="button"
                onClick={() => onChange(n)}
                aria-current={n === current ? "page" : undefined}
                aria-label={`Page ${n}`}
                className={cn(
                  "flex size-44 items-center justify-center border p-mono tabular-nums transition-colors max-lg:size-[40px]",
                  n === current ? "border-p-text bg-p-text text-p-paper" : "border-p-text/15 text-p-text hover:border-p-text",
                )}
              >
                {String(n).padStart(2, "0")}
              </button>
            </li>
          ))}
        </ol>
        <button type="button" onClick={() => onChange(current + 1)} disabled={current === count} className={cn(arrow, "group")}>
          <span className="p-underline">Next</span>
          <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
        </button>
      </div>
    </nav>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b border-p-text/12 py-20 max-lg:py-[18px]">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className="mb-12 p-mono text-p-grey max-lg:mb-[10px]">
        {title}
      </p>
      <div className="flex flex-col gap-10 max-lg:gap-[10px]">{children}</div>
    </fieldset>
  );
}

function Choice({ type, name, checked, onChange, label, count }: { type: "radio" | "checkbox"; name?: string; checked: boolean; onChange: () => void; label: string; count?: number }) {
  return (
    <label className="flex cursor-pointer items-center gap-12 p-body fs-15 max-lg:gap-[12px] max-lg:text-[15px]">
      <input type={type} name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        aria-hidden
        className={cn(
          "flex size-16 shrink-0 items-center justify-center border border-p-text/50 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 max-lg:size-[16px]",
          type === "radio" ? "rounded-full" : "",
          checked && "border-p-text bg-p-text",
        )}
      >
        {checked && <span className={cn("bg-p-paper", type === "radio" ? "size-6 rounded-full max-lg:size-[6px]" : "h-[1.5px] w-8 max-lg:w-[8px]")} />}
      </span>
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="p-mono-sm text-p-grey">{count}</span>}
    </label>
  );
}
