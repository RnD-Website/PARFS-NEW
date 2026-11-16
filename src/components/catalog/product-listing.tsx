import { commerce } from "@/lib/commerce";
import type { ProductQuery } from "@/lib/commerce/types";
import { ProductCard } from "@/components/commerce/product-card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ButtonLink } from "@/components/ui/button";
import { Breadcrumbs } from "./breadcrumbs";
import { Filters, SortSelect } from "./filters";
import { Pagination } from "./pagination";
import { pluralize } from "@/lib/utils/format";
import { AskAIEmptyState } from "./ask-ai-empty";

/** Shared listing page: Shop, category, Deals, New in. */
export async function ProductListing({
  title,
  eyebrow,
  description,
  query,
  basePath,
  pathname,
  crumbs,
  rawParams,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  query: ProductQuery;
  basePath: "shop" | "deals" | "new";
  pathname: string;
  crumbs: { name: string; href: string }[];
  rawParams: Record<string, string | string[] | undefined>;
}) {
  const [result, categories] = await Promise.all([commerce.getProducts(query), commerce.getCategories()]);
  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(rawParams)) if (typeof v === "string" && k !== "page") qs.set(k, v);
    if (p > 1) qs.set("page", String(p));
    return `${pathname}${qs.size ? `?${qs}` : ""}`;
  };

  return (
    <div className="container-page pt-6 pb-16 lg:pt-10 lg:pb-24">
      <Breadcrumbs items={crumbs} />
      <header className="mt-6 flex flex-col gap-3.5 lg:mt-8">
        <Eyebrow>{eyebrow.toUpperCase()}</Eyebrow>
        <h1 className="text-h1">{title}</h1>
        {description && <p className="max-w-2xl text-body text-ink-2">{description}</p>}
      </header>

      <div className="mt-8 grid gap-8 lg:mt-10 lg:grid-cols-[240px_1fr] lg:gap-12">
        <Filters categories={categories} activeCategory={query.category} basePath={basePath} priceRange={result.priceRange} total={result.total} />
        <div>
          <div className="mb-6 flex items-center justify-between gap-4 max-lg:-mt-[68px] max-lg:ml-auto max-lg:w-fit lg:mb-8">
            <p className="hidden text-body-sm text-ink-muted lg:block" aria-live="polite">
              {pluralize(result.total, "product")}
            </p>
            <SortSelect />
          </div>
          <p className="mb-4 text-body-sm text-ink-muted lg:hidden" aria-live="polite">
            {pluralize(result.total, "product")}
          </p>
          {result.items.length ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:gap-y-10">
              {result.items.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} priority={i < 3} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-[24px] bg-card px-6 py-16 text-center">
              <p className="text-h3">No products match these filters</p>
              <p className="max-w-md text-body text-ink-muted">Try removing a filter, or describe what you need and GASENOS AI will search for you.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <ButtonLink href={pathname} variant="outline">
                  Clear filters
                </ButtonLink>
                <AskAIEmptyState prompt={query.search ? `Help me find ${query.search}` : `Help me find something in ${title}`} />
              </div>
            </div>
          )}
          <Pagination page={result.page} pageCount={result.pageCount} href={pageHref} />
        </div>
      </div>
    </div>
  );
}
