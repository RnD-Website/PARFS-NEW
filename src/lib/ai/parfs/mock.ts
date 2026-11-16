import "server-only";
import { parfsCatalog } from "@/content/parfs-catalog";
import type { AIEvent, AIProvider } from "../types";
import { buildPicks, compareFragrances, fold, getPolicy, searchFragrances } from "./knowledge";

/**
 * PARFS Concierge without an API key (AI_PROVIDER unset or "mock"): a rule-based advisor that reads
 * budgets, scent families, notes, concentration, gifting and policy questions from the shopper's
 * words and answers from the same collection and policy data as the Claude provider.
 */

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function* say(text: string): AsyncGenerator<AIEvent> {
  for (const chunk of text.match(/.{1,18}(\s|$)/g) ?? [text]) {
    yield { type: "text", delta: chunk };
    await sleep(18);
  }
}

const FAMILY_WORDS: Record<string, "Woody" | "Floral" | "Amber" | "Fresh"> = {
  woody: "Woody", wood: "Woody", oud: "Woody", smoky: "Woody", leather: "Woody", sandalwood: "Woody", cedar: "Woody",
  floral: "Floral", flower: "Floral", flowers: "Floral", rose: "Floral", jasmine: "Floral", romantic: "Floral", feminine: "Floral",
  amber: "Amber", warm: "Amber", vanilla: "Amber", sweet: "Amber", spicy: "Amber", cozy: "Amber", cosy: "Amber", evening: "Amber", night: "Amber",
  fresh: "Fresh", citrus: "Fresh", summer: "Fresh", clean: "Fresh", light: "Fresh", green: "Fresh", day: "Fresh", office: "Fresh", sea: "Fresh",
};

const FOLLOW_UPS = ["Something warmer", "Show me fresher scents", "Compare the first two", "What's the difference between EDP and extrait?"];

export const parfsMockProvider: AIProvider = {
  name: "mock",
  async *respond(turns, ctx) {
    const raw = turns.at(-1)?.text ?? "";
    const q = fold(raw);
    const has = (...w: string[]) => w.some((x) => q.includes(x));

    // ── Policies & questions ──────────────────────────────────────────────
    if (has("track", "where is my order", "order status", "my order")) {
      yield* say("You can follow your order from the tracking link in your shipping email, or on our Contact page under “Your order” — just enter your order number and the email you used at checkout.");
      yield { type: "suggestions", items: ["How long does delivery take?", "What is your returns policy?"] };
      return;
    }
    if (has("deliver", "shipping", "ship ", "arrive", "how long does it take")) {
      const p = getPolicy("shipping") as { faq: { q: string; a: string }[] };
      yield* say(`${p.faq[0]?.a ?? ""} ${p.faq[1]?.a ?? ""}`.trim());
      yield { type: "suggestions", items: ["Can I return a fragrance?", "Do you ship internationally?", "Find me a fragrance"] };
      return;
    }
    if (has("return", "refund", "exchange")) {
      const p = getPolicy("returns") as { faq: { q: string; a: string }[] };
      yield* say(`${p.faq[0]?.a ?? ""} ${p.faq[1]?.a ?? ""}`.trim());
      yield { type: "suggestions", items: ["How do I start a return?", "Book a private consultation"] };
      return;
    }
    if (has("engrav", "gift message", "gift wrap", "wrap")) {
      const p = getPolicy("gifting_engraving") as { faq: { q: string; a: string }[] };
      yield* say(`${p.faq[1]?.a ?? p.faq[0]?.a ?? ""}`);
      yield { type: "suggestions", items: ["A gift for her under $170", "A gift for him"] };
      return;
    }
    if (has("pay", "shop pay", "card")) {
      const p = getPolicy("payment") as { faq: { q: string; a: string }[] };
      yield* say(p.faq.find((f) => /payment/i.test(f.q))?.a ?? "Payment is taken securely at checkout.");
      return;
    }
    if (has("consult", "specialist", "appointment", "advisor")) {
      yield* say("I'd be delighted to arrange that. A private consultation is a one-to-one session with a PARFS specialist, in person or by video — request one from our Contact page and we'll reply within one business day.");
      return;
    }
    if (has("difference", " vs", "versus", "what is", "what's", "whats", "explain") && has("edp", "extrait", "eau de parfum", "concentration")) {
      yield* say("It's about intensity. Our eaux de parfum are luminous and made for every day; our extraits carry more perfume oil, so they sit closer to the skin and last longer — perfect for evenings.");
      yield { type: "suggestions", items: ["Show me the extraits", "Show me the eaux de parfum"] };
      return;
    }
    if (has("last", "longevity", "long lasting", "how long does")) {
      yield* say("Every PARFS fragrance is made with an 18% perfume concentrate, so most wear for eight hours or more. Apply to pulse points and let it dry naturally — no rubbing.");
      return;
    }
    if (has("hello", "hi ", "hey") && q.length < 12) {
      yield* say("Good to see you. Tell me what you'd like to feel — warm and smoky, fresh and bright, soft and floral — and I'll find your scent.");
      yield { type: "suggestions", items: ["A woody scent under $200", "Something fresh for summer", "A romantic floral"] };
      return;
    }

    // ── Compare ──────────────────────────────────────────────────────────
    if (has("compare", " vs", "versus", "difference between")) {
      const named = parfsCatalog.filter((c) => q.includes(fold(c.name))).map((c) => c.slug);
      const slugs = named.length >= 2 ? named : (turns.at(-2)?.productSlugs ?? []).slice(0, 2);
      const res = slugs.length >= 2 ? compareFragrances(slugs.slice(0, 4)) : null;
      if (res && !("error" in res)) {
        yield* say("Here they are side by side.");
        yield { type: "comparison", data: res.table };
        return;
      }
    }

    // ── Find fragrances ──────────────────────────────────────────────────
    yield { type: "status", label: "Searching the collection…" };
    const under = raw.match(/(?:under|below|less than|max|up to|<)\s*\$?\s*(\d{2,4})/i);
    const over = raw.match(/(?:over|above|more than|from)\s*\$?\s*(\d{2,4})/i);
    const words = q.split(/[^a-z]+/);
    const family = words.map((w) => FAMILY_WORDS[w]).find(Boolean);
    const concentration = has("extrait", "intense", "strong")
      ? ("Extrait de Parfum" as const)
      : /\beaux? de parfum\b|\bedps?\b|everyday/.test(q)
        ? ("Eau de Parfum" as const)
        : undefined;
    const named = parfsCatalog.find((c) => q.includes(fold(c.name)));
    const gift = has("gift", "present", "for her", "for him", "wife", "husband", "mother", "father", "girlfriend", "boyfriend");
    const noteQuery = words.filter((w) => w.length > 3 && !FAMILY_WORDS[w] && !["eaux", "parfum", "parfums", "extrait", "extraits", "show"].includes(w)).join(" ");

    let found = named
      ? { items: [{ slug: named.slug }] }
      : searchFragrances({ query: noteQuery, family, concentration, max_price_usd: under ? Number(under[1]) : undefined, min_price_usd: over ? Number(over[1]) : undefined, limit: 4 });
    if (!found.items.length) found = searchFragrances({ family, concentration, max_price_usd: under ? Number(under[1]) : undefined, limit: 4 });
    if (!found.items.length) found = searchFragrances({ sort: "relevance", limit: 4 });

    const picks = await buildPicks(found.items.slice(0, 4).map((i) => {
      const c = parfsCatalog.find((x) => x.slug === i.slug)!;
      return { slug: c.slug, reason: `${c.family} · ${c.notes}` };
    }));

    const intro = named
      ? `${named.name} — ${named.notes.toLowerCase()}. A ${named.concentration.toLowerCase()} in ${named.volume}, $${named.price}.`
      : gift
        ? "A beautiful gesture. These arrive in our signature box, and you can add a gift message in your bag."
        : family
          ? `Here are a few ${family.toLowerCase()} scents I think you'll love${under ? ` under $${under[1]}` : ""}.`
          : concentration
            ? concentration === "Extrait de Parfum"
              ? "Our extraits — richer, deeper and made to linger close to the skin."
              : "Our eaux de parfum — luminous, easy to wear and made for every day."
          : under
            ? `Here's what I'd suggest under $${under[1]}.`
            : "Here are a few I'd suggest to start with — tell me more about what you love and I'll refine.";
    yield* say(intro);
    if (picks.length) yield { type: "products", items: picks };
    yield { type: "suggestions", items: FOLLOW_UPS };
    void ctx;
  },
};
