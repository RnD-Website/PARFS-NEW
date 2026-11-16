import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import { ProductCard } from "@/components/commerce/product-card";
import { AISearchBar } from "@/components/ai/ai-search-bar";
import { SearchAIAnswer } from "@/components/catalog/search-ai-answer";
import { Eyebrow } from "@/components/ui/eyebrow";
import { pluralize } from "@/lib/utils/format";
import { parseListingParams, type SearchParams } from "@/components/catalog/query";
import { Pagination } from "@/components/catalog/pagination";
import { SortSelect } from "@/components/catalog/filters";

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const q = (await searchParams).q;
  return { title: q ? `Search: ${q}` : "Search", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 200);
  const query = parseListingParams(sp);
  // Natural-language queries ("gift for dad under 12000") often don't match keywords —
  // keyword results are shown alongside GASENOS AI's answer.
  const result = q ? await commerce.getProducts({ ...query, search: q }) : null;

  return (
    <div className="container-page pt-8 pb-16 lg:pt-12 lg:pb-24">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Eyebrow>SEARCH</Eyebrow>
        <h1 className="text-h1">{q ? <>Results for “{q}”</> : "What are you looking for?"}</h1>
        <AISearchBar key={q} defaultValue={q} size="lg" />
      </div>

      {q && (
        <div className="mx-auto mt-8 max-w-3xl">
          <SearchAIAnswer key={q} query={q} />
        </div>
      )}

      {result && (
        <section aria-labelledby="results-title" className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 id="results-title" className="text-h3">
              {pluralize(result.total, "matching product")}
            </h2>
            {result.total > 1 && <SortSelect />}
          </div>
          {result.items.length ? (
            <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4">
              {result.items.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-[20px] bg-card p-8 text-center text-body text-ink-muted">
              No exact keyword matches — see GASENOS AI’s suggestions above, or browse all products.
            </p>
          )}
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            href={(p) => `/search?q=${encodeURIComponent(q)}${typeof sp.sort === "string" ? `&sort=${sp.sort}` : ""}${p > 1 ? `&page=${p}` : ""}`}
          />
        </section>
      )}
    </div>
  );
}
