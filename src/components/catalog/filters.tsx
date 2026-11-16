"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import type { Category } from "@/lib/commerce/types";
import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { Spinner } from "@/components/ui/spinner";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

function useParamsUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    start(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  return { params, update, pending };
}

export function SortSelect() {
  const { params, update, pending } = useParamsUpdater();
  return (
    <label className="flex items-center gap-2 text-body-sm">
      <span className="hidden text-ink-muted sm:inline">Sort by</span>
      <span className="relative">
        <select
          value={params.get("sort") ?? "featured"}
          onChange={(e) => update({ sort: e.target.value === "featured" ? null : e.target.value })}
          className="h-11 appearance-none rounded-full border-[1.5px] border-line bg-white pr-10 pl-4 text-[14px] font-semibold outline-none hover:border-ink/40 focus:border-ink"
          aria-label="Sort products"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {pending ? (
          <Spinner size={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
        ) : (
          <Icon name="arrow-down" size={16} className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2" />
        )}
      </span>
    </label>
  );
}

function FilterPanel({
  categories,
  activeCategory,
  basePath,
  priceRange,
  onDone,
}: {
  categories: Category[];
  activeCategory?: string;
  basePath: "shop" | "deals" | "new";
  priceRange: { min: number; max: number };
  onDone?: () => void;
}) {
  const { params, update, pending } = useParamsUpdater();
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  const rating = params.get("rating");

  const applyPrice = (e: FormEvent) => {
    e.preventDefault();
    update({ min: min || null, max: max || null });
    onDone?.();
  };
  const catHref = (slug?: string) => {
    const qs = new URLSearchParams(params.toString());
    qs.delete("page");
    if (basePath === "shop") {
      qs.delete("category");
      return `/shop${slug ? `/${slug}` : ""}${qs.size ? `?${qs}` : ""}`;
    }
    if (slug) qs.set("category", slug);
    else qs.delete("category");
    return `/${basePath}${qs.size ? `?${qs}` : ""}`;
  };
  const hasFilters = ["min", "max", "rating", "sale", "instock"].some((k) => params.get(k));

  return (
    <div className={cn("flex flex-col gap-8 transition-opacity", pending && "opacity-60")}>
      <div>
        <h3 className="mb-3 text-label">Category</h3>
        <ul className="flex flex-col gap-1">
          {[{ slug: undefined, name: "All products", productCount: undefined } as Partial<Category>, ...categories].map((c) => {
            const active = (c.slug ?? undefined) === activeCategory;
            return (
              <li key={c.slug ?? "all"}>
                <Link
                  href={catHref(c.slug)}
                  onClick={onDone}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-body-sm transition-colors",
                    active ? "bg-ink font-semibold text-white" : "hover:bg-ink/5",
                  )}
                >
                  {c.name}
                  {c.productCount != null && <span className={active ? "text-white/70" : "text-ink-faint"}>{c.productCount}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <form onSubmit={applyPrice}>
        <h3 className="mb-1 text-label">Price (৳)</h3>
        {priceRange.max > 0 && (
          <p className="mb-3 text-caption text-ink-muted">
            {formatMoney(priceRange.min)} – {formatMoney(priceRange.max)}
          </p>
        )}
        <div className="flex items-center gap-2">
          <input
            inputMode="numeric"
            aria-label="Minimum price in taka"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))}
            className="h-11 w-full min-w-0 rounded-xl border-[1.5px] border-line bg-white px-3 outline-none focus:border-ink"
          />
          <span className="text-ink-faint">–</span>
          <input
            inputMode="numeric"
            aria-label="Maximum price in taka"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))}
            className="h-11 w-full min-w-0 rounded-xl border-[1.5px] border-line bg-white px-3 outline-none focus:border-ink"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="mt-3">
          Apply price
        </Button>
      </form>

      <fieldset>
        <legend className="mb-3 text-label">Rating</legend>
        <div className="flex flex-wrap gap-2">
          {["4.5", "4"].map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={rating === r}
              onClick={() => update({ rating: rating === r ? null : r })}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-[14px] font-semibold transition-colors",
                rating === r ? "border-ink bg-ink text-white" : "border-line hover:border-ink",
              )}
            >
              <Icon name="star" size={14} filled className={rating === r ? "text-orange-soft" : "text-orange"} /> {r}+
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-label">Availability & offers</legend>
        {basePath !== "deals" && (
          <label className="flex cursor-pointer items-center justify-between gap-3 text-body-sm">
            On sale
            <input type="checkbox" className="size-5 accent-ink" checked={params.get("sale") === "1"} onChange={(e) => update({ sale: e.target.checked ? "1" : null })} />
          </label>
        )}
        <label className="flex cursor-pointer items-center justify-between gap-3 text-body-sm">
          In stock only
          <input type="checkbox" className="size-5 accent-ink" checked={params.get("instock") === "1"} onChange={(e) => update({ instock: e.target.checked ? "1" : null })} />
        </label>
      </fieldset>

      {hasFilters && (
        <button
          type="button"
          onClick={() => {
            setMin("");
            setMax("");
            update({ min: null, max: null, rating: null, sale: null, instock: null });
          }}
          className="self-start text-body-sm font-semibold underline underline-offset-4 hover:text-orange-text"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

export function Filters(props: Parameters<typeof FilterPanel>[0] & { total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside aria-label="Filters" className="hidden lg:block">
        <FilterPanel {...props} />
      </aside>
      <div className="lg:hidden">
        <Button variant="outline" size="sm" icon="filter" onClick={() => setOpen(true)}>
          Filters
        </Button>
        <Drawer
          open={open}
          onOpenChange={setOpen}
          title="Filters"
          side="bottom"
          footer={
            <Button fullWidth onClick={() => setOpen(false)}>
              Show {props.total} {props.total === 1 ? "result" : "results"}
            </Button>
          }
        >
          <div className="px-5 pb-6">
            <FilterPanel {...props} onDone={() => setOpen(false)} />
          </div>
        </Drawer>
      </div>
    </>
  );
}
