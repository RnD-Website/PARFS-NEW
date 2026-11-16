"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { parfsCatalog, type CatalogItem } from "@/content/parfs-catalog";
import { cn } from "@/lib/utils/cn";

const SUGGESTED = ["Noir Absolu", "Rose Lumière", "Émeraude", "Extrait de Parfum", "Woody", "Amber"];
const FEATURED = ["noir-absolu", "rose-lumiere", "emeraude", "ambre-nuit", "nocturne", "oud-imperial", "lumiere-doree", "bois-sacre"];

/** Accent-insensitive lowercase, so "emeraude" finds "Émeraude". */
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function matches(item: CatalogItem, q: string) {
  const hay = fold(`${item.name} ${item.notes} ${item.family} ${item.concentration} ${item.volume}`);
  return fold(q)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

/**
 * PARFS search — after étoile.com's search drop-down: a panel that slides down under the header with a
 * search field, "Suggested searches" on the left and a row of product cards on the right (featured
 * scents until you type, then live results from the catalogue) with ← → controls.
 */
export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const track = useRef<HTMLUListElement>(null);

  const q = query.trim();
  const results = useMemo(() => (q ? parfsCatalog.filter((i) => matches(i, q)) : FEATURED.map((s) => parfsCatalog.find((i) => i.slug === s)).filter(Boolean) as CatalogItem[]), [q]);

  // Focus the field when the panel opens.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => input.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [open]);

  // Back to the first card whenever the results change.
  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
  }, [q]);

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.75, behavior: "smooth" });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (results[0] && q) {
      onClose();
      router.push(`/products/${results[0].slug}`);
    }
  };

  return (
    <div className={cn("fixed inset-0 z-[45] transition-[visibility] duration-700", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div onClick={onClose} className={cn("absolute inset-0 bg-p-ink/40 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        data-lenis-prevent
        className={cn(
          "absolute inset-x-0 top-0 max-h-[100svh] overflow-y-auto bg-p-paper pt-72 text-p-text transition-[clip-path] duration-700 ease-out-expo max-lg:pt-[60px]",
          open ? "[clip-path:inset(0_0_0_0)]" : "[clip-path:inset(0_0_100%_0)]",
        )}
      >
        <div className="mx-auto max-w-[1920px] px-40 pt-16 pb-48 max-lg:px-[20px] max-lg:pt-[12px] max-lg:pb-[32px]">
          {/* Field */}
          <form onSubmit={submit} role="search" className="flex items-center gap-14 border-b border-p-text/15 pb-16 max-lg:gap-[12px] max-lg:pb-[14px]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" aria-hidden className="shrink-0 text-p-grey">
              <circle cx="10.5" cy="10.5" r="6" />
              <path d="m15 15 5 5" />
            </svg>
            <label htmlFor="parfs-search" className="sr-only">
              Search fragrances
            </label>
            <input
              ref={input}
              id="parfs-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && onClose()}
              placeholder="Search fragrances or notes"
              autoComplete="off"
              tabIndex={open ? 0 : -1}
              className="min-w-0 flex-1 bg-transparent font-italiana fs-36 leading-none text-p-text outline-none placeholder:text-p-grey/60 max-lg:text-[26px] [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} tabIndex={open ? 0 : -1} className="p-mono-sm text-p-grey transition-colors hover:text-p-text">
                Clear
              </button>
            )}
            <button type="button" onClick={onClose} tabIndex={open ? 0 : -1} className="p-mono text-p-grey transition-colors hover:text-p-text" aria-label="Close search">
              Close ✕
            </button>
          </form>

          <div className="mt-28 grid grid-cols-[calc(var(--spacing)*220)_minmax(0,1fr)] gap-40 max-lg:mt-[22px] max-lg:grid-cols-1 max-lg:gap-[24px]">
            {/* Suggestions */}
            <div className="lg:border-r lg:border-p-text/12 lg:pr-24">
              <p className="p-mono-sm text-p-grey">Suggested searches</p>
              <ul className="mt-14 flex flex-col gap-10 max-lg:mt-[12px] max-lg:flex-row max-lg:flex-wrap max-lg:gap-x-[16px] max-lg:gap-y-[8px]">
                {SUGGESTED.map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => setQuery(s)} tabIndex={open ? 0 : -1} className={cn("p-body fs-15 transition-colors hover:text-p-gold max-lg:text-[15px]", fold(q) === fold(s) ? "text-p-text underline underline-offset-4" : "text-p-text/80")}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
              <Link href="/collection" onClick={onClose} tabIndex={open ? 0 : -1} className="group mt-24 inline-flex items-center gap-8 p-mono max-lg:mt-[16px] max-lg:gap-[8px]">
                <span className="p-underline">View all fragrances</span>
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
              </Link>
            </div>

            {/* Results */}
            <div className="min-w-0">
              <div className="flex items-center justify-between">
                <p className="p-mono-sm text-p-grey" aria-live="polite">
                  {q ? `${results.length} ${results.length === 1 ? "result" : "results"} for “${q}”` : "Featured"}
                </p>
                <div className="flex gap-6 max-lg:hidden">
                  {([-1, 1] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => scrollBy(d)}
                      tabIndex={open ? 0 : -1}
                      aria-label={d < 0 ? "Previous results" : "Next results"}
                      className="flex size-32 items-center justify-center border border-p-text/20 text-p-text transition-colors hover:border-p-text"
                    >
                      {d < 0 ? "←" : "→"}
                    </button>
                  ))}
                </div>
              </div>

              {results.length === 0 ? (
                <div className="py-60 max-lg:py-[40px]">
                  <p className="font-italiana fs-36 leading-none max-lg:text-[28px]">No fragrance found</p>
                  <p className="mt-12 p-body fs-15 text-p-text/70 max-lg:mt-[10px] max-lg:text-[15px]">Try a scent name, a note such as “oud” or “rose”, or a family like “Floral”.</p>
                </div>
              ) : (
                <ul ref={track} key={q} className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-12 overflow-x-auto max-lg:mt-[12px] max-lg:gap-[10px]">
                  {results.map((item, i) => (
                    <li
                      key={item.slug}
                      className="w-[calc((100%_-_var(--spacing)_*_36)_/_4)] shrink-0 snap-start animate-[p-card-in_0.7s_cubic-bezier(0.16,1,0.3,1)_both] max-lg:w-[46%]"
                      style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }}
                    >
                      <Link href={`/products/${item.slug}`} onClick={onClose} tabIndex={open ? 0 : -1} className="group block">
                        <span className="relative block aspect-[4/5] overflow-hidden bg-p-sand">
                          <Image src={item.image} alt={item.imageAlt} fill sizes="(min-width: 1024px) 20vw, 46vw" className="object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.04]" />
                        </span>
                        <span className="mt-10 flex items-start justify-between gap-10 max-lg:mt-[8px]">
                          <span className="font-italiana fs-22 leading-[1.1] max-lg:text-[18px]">{item.name}</span>
                          <span className="shrink-0 p-body fs-14 max-lg:text-[14px]">${item.price}</span>
                        </span>
                        <span className="mt-4 block p-mono-sm text-p-grey max-lg:mt-[4px]">
                          {item.concentration} · {item.volume}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
