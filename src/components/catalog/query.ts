import type { ProductQuery, SortKey } from "@/lib/commerce/types";

export type SearchParams = Record<string, string | string[] | undefined>;

const SORTS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "rating"];
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** URL search params → catalogue query. Prices in the URL are whole taka. */
export function parseListingParams(sp: SearchParams): ProductQuery {
  const sort = one(sp.sort) as SortKey | undefined;
  const min = num(one(sp.min));
  const max = num(one(sp.max));
  return {
    search: one(sp.q)?.slice(0, 120) || undefined,
    category: one(sp.category) || undefined,
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    minPrice: min != null ? min * 100 : undefined,
    maxPrice: max != null ? max * 100 : undefined,
    minRating: num(one(sp.rating)),
    onSale: one(sp.sale) === "1" || undefined,
    inStock: one(sp.instock) === "1" || undefined,
    page: Math.max(1, Math.floor(num(one(sp.page)) ?? 1)),
    pageSize: 12,
  };
}
