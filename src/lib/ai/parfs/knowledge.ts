import "server-only";
import { z } from "zod";
import { parfsCatalog, type CatalogItem } from "@/content/parfs-catalog";
import { faqTopics } from "@/content/parfs-faq";
import { legalPages } from "@/content/parfs-legal";
import { commerce } from "@/lib/commerce";
import type { AIComparison, AIProductPick } from "../types";

/**
 * What the PARFS concierge knows: the fragrance collection (src/content/parfs-catalog.ts, USD prices)
 * and the Maison's policies (the FAQ and legal pages). Product cards carry the live store product so
 * "Add to bag" works in the chat.
 */

const FAMILIES = ["Woody", "Floral", "Amber", "Fresh"] as const;

export const searchInput = z.object({
  query: z.string().max(200).optional(),
  family: z.enum(FAMILIES).optional(),
  concentration: z.enum(["Eau de Parfum", "Extrait de Parfum"]).optional(),
  min_price_usd: z.number().nonnegative().optional(),
  max_price_usd: z.number().positive().optional(),
  sort: z.enum(["relevance", "price-asc", "price-desc"]).optional(),
  limit: z.number().int().min(1).max(12).optional(),
});
export const slugInput = z.object({ slug: z.string().min(1).max(120) });
export const compareInput = z.object({ slugs: z.array(z.string().min(1).max(120)).min(2).max(4) });
export const showInput = z.object({
  picks: z
    .array(z.object({ slug: z.string().min(1).max(120), reason: z.string().max(200).optional() }))
    .min(1)
    .max(6),
});
export const policyInput = z.object({
  topic: z.enum(["shipping", "returns", "payment", "gifting_engraving", "consultation", "order_tracking", "fragrance_care", "privacy"]),
});

/** Accent-insensitive lowercase ("emeraude" finds "Émeraude"). */
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const facts = (c: CatalogItem) => ({
  slug: c.slug,
  name: c.name,
  price_usd: c.price,
  family: c.family,
  concentration: c.concentration,
  volume: c.volume,
  notes: c.notes,
  tag: c.tag ?? null,
});

const STOP = new Set(["a", "an", "the", "for", "with", "and", "or", "of", "to", "me", "my", "i", "want", "need", "something", "scent", "scents", "fragrance", "fragrances", "perfume", "perfumes", "show", "find", "looking", "like", "under", "below", "over", "some", "that", "is", "it", "please"]);

export function searchFragrances(input: z.infer<typeof searchInput>) {
  const words = fold(input.query ?? "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
  const scored = parfsCatalog
    .filter((c) => (!input.family || c.family === input.family) && (!input.concentration || c.concentration === input.concentration))
    .filter((c) => (input.min_price_usd === undefined || c.price >= input.min_price_usd) && (input.max_price_usd === undefined || c.price <= input.max_price_usd))
    .map((c) => {
      const hay = fold(`${c.name} ${c.notes} ${c.family} ${c.concentration} ${c.tag ?? ""}`);
      const score = words.reduce((n, w) => n + (hay.includes(w) ? (fold(c.name).includes(w) ? 3 : 1) : 0), 0);
      return { c, score };
    })
    .filter((x) => !words.length || x.score > 0);
  if (input.sort === "price-asc") scored.sort((a, b) => a.c.price - b.c.price);
  else if (input.sort === "price-desc") scored.sort((a, b) => b.c.price - a.c.price);
  else scored.sort((a, b) => b.score - a.score || Number(!!b.c.tag) - Number(!!a.c.tag));
  const items = scored.slice(0, input.limit ?? 6).map((x) => facts(x.c));
  return { count: scored.length, items };
}

export function getFragrance(slug: string) {
  const c = parfsCatalog.find((x) => x.slug === slug);
  return c ? { ...facts(c), url: `/products/${c.slug}` } : { error: `No PARFS fragrance with slug "${slug}"` };
}

export function compareFragrances(slugs: string[]): { table: AIComparison; facts: unknown[] } | { error: string } {
  const items = slugs.map((s) => parfsCatalog.find((c) => c.slug === s)).filter((c): c is CatalogItem => !!c);
  if (items.length < 2) return { error: "Need at least two known fragrances to compare." };
  return {
    table: {
      products: items.map((c) => ({ slug: c.slug, name: c.name })),
      rows: [
        { label: "Price", values: items.map((c) => `$${c.price}`) },
        { label: "Family", values: items.map((c) => c.family) },
        { label: "Concentration", values: items.map((c) => c.concentration) },
        { label: "Size", values: items.map((c) => c.volume) },
        { label: "Notes", values: items.map((c) => c.notes) },
      ],
    },
    facts: items.map(facts),
  };
}

/** Product cards for the chat: catalogue copy + the live store product (for Add to bag). */
export async function buildPicks(picks: { slug: string; reason?: string }[]): Promise<AIProductPick[]> {
  const known = picks.filter((p) => parfsCatalog.some((c) => c.slug === p.slug));
  if (!known.length) return [];
  const page = await commerce.getProducts({ slugs: known.map((p) => p.slug), pageSize: known.length }).catch(() => ({ items: [] }));
  const bySlug = new Map(page.items.map((p) => [p.slug, p]));
  return known.flatMap((p) => {
    const product = bySlug.get(p.slug);
    return product ? [{ product, reason: p.reason }] : [];
  });
}

const faqAnswers = (topicId: string) => faqTopics.find((t) => t.id === topicId)?.items.map((i) => ({ q: i.q, a: i.a.join(" ") })) ?? [];
const legalText = (slug: string) => legalPages.find((p) => p.slug === slug)?.articles.map((a) => ({ title: a.title, text: a.body.join(" ") })) ?? [];

export function getPolicy(topic: z.infer<typeof policyInput>["topic"]) {
  switch (topic) {
    case "shipping":
      return { source: "/legal/shipping", faq: faqAnswers("delivery"), policy: legalText("shipping") };
    case "returns":
      return { source: "/legal/returns", faq: faqAnswers("returns"), policy: legalText("returns") };
    case "payment":
      return { faq: faqAnswers("orders") };
    case "gifting_engraving":
      return { faq: faqAnswers("gifting") };
    case "consultation":
      return { source: "/contact", faq: faqAnswers("services") };
    case "order_tracking":
      return {
        source: "/contact",
        how: "Orders are tracked from the tracking link in the shipping email, or on the Contact page under “Your order” with the order number and checkout email.",
      };
    case "fragrance_care":
      return { faq: faqAnswers("fragrance") };
    case "privacy":
      return { source: "/legal/privacy", policy: legalText("privacy").slice(0, 4) };
  }
}
