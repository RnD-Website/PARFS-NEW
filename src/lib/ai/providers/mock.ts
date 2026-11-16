import "server-only";
import { commerce } from "@/lib/commerce";
import type { ProductSummary } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils/money";
import { storePolicy } from "@/content/site";
import { faqs } from "@/content/faq";
import type { AIEvent, AIProvider, ChatContext, ChatTurn } from "../types";
import { buildPicks, compareProducts, getOrderStatus } from "../tools";

/**
 * Rule-based assistant that works with no API key. It parses intent (budget, size,
 * colour, category, compare, policy, order) and answers ONLY from the live catalogue
 * and store policy via the same tools the Claude provider uses.
 * Switch to the real model with AI_PROVIDER=anthropic.
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  footwear: ["shoe", "shoes", "sneaker", "sneakers", "running", "runner", "trainer", "trainers", "footwear", "5k", "run", "runs", "walks", "walking"],
  audio: ["headphone", "headphones", "earbud", "earbuds", "buds", "speaker", "audio", "music", "earphones"],
  electronics: ["watch", "smartwatch", "gadget", "gadgets", "tech", "electronics", "wearable"],
  fashion: ["jacket", "clothes", "clothing", "outfit", "fashion", "coat"],
  "home-living": ["chair", "furniture", "home", "sofa", "living room", "reading corner", "lounge"],
  beauty: ["serum", "skincare", "skin", "beauty", "glow"],
};

const COLORS = ["black", "white", "orange", "grey", "gray", "off-white", "volt orange"];

type Parsed = {
  text: string;
  maxPrice?: number;
  minPrice?: number;
  size?: string;
  color?: string;
  categories: string[];
};

function parseAmount(raw: string, usd: boolean) {
  let n = parseFloat(raw.replace(/,/g, ""));
  if (/k$/i.test(raw)) n *= 1000;
  return usd ? n * 120 : n; // $ → ৳ at the placeholder catalogue rate
}

function parse(text: string): Parsed {
  const t = text.toLowerCase();
  const out: Parsed = { text: t, categories: [] };
  const under = t.match(/(?:under|below|less than|max(?:imum)?|up to|within)\s*(৳|\$|tk\.?|bdt)?\s*([\d,.]+k?)/);
  if (under) out.maxPrice = parseAmount(under[2], under[1] === "$");
  const over = t.match(/(?:over|above|more than|at least)\s*(৳|\$|tk\.?|bdt)?\s*([\d,.]+k?)/);
  if (over) out.minPrice = parseAmount(over[2], over[1] === "$");
  const size = t.match(/\b(?:eu|size)\s*(\d{2})\b/);
  if (size) out.size = size[1];
  out.color = COLORS.find((c) => new RegExp(`\\b${c}\\b`).test(t));
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => new RegExp(`\\b${w}\\b`).test(t))) out.categories.push(cat);
  }
  return out;
}

async function allProducts() {
  return (await commerce.getProducts({ pageSize: 48 })).items;
}

/** Products whose distinctive name words appear in the text (e.g. "aero runner"). */
function mentioned(products: ProductSummary[], text: string) {
  const stop = new Set(["the", "set", "pro", "x", "2", "s2", "sneaker", "headphones", "chair", "jacket", "speaker", "bluetooth"]);
  return products.filter((p) => {
    const words = p.name.toLowerCase().split(/\s+/).filter((w) => !stop.has(w) && w.length > 2);
    return words.length > 0 && words.every((w) => text.includes(w));
  });
}

async function* say(text: string): AsyncIterable<AIEvent> {
  // Stream word-by-word so the UI behaves exactly like a live model.
  const parts = text.split(/(\s+)/);
  for (let i = 0; i < parts.length; i += 6) {
    yield { type: "text", delta: parts.slice(i, i + 6).join("") };
    await new Promise((r) => setTimeout(r, 12));
  }
}

function listJoin(items: string[]) {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`;
}

function priceLine(p: ProductSummary) {
  const sale = p.compareAtPrice && p.compareAtPrice > p.price;
  return `${formatMoney(p.price, p.currency)}${sale ? ` (was ${formatMoney(p.compareAtPrice!, p.currency)})` : ""}`;
}

export const mockProvider: AIProvider = {
  name: "mock",
  async *respond(turns: ChatTurn[], ctx: ChatContext) {
    const last = turns.at(-1)?.text ?? "";
    const q = parse(last);
    const t = q.text;
    const products = await allProducts();
    // Remember the shopper's size from earlier in the conversation.
    const rememberedSize = q.size ?? [...turns].reverse().map((x) => (x.role === "user" ? parse(x.text).size : undefined)).find(Boolean);
    const previous = [...turns].reverse().find((x) => x.role === "assistant" && x.productSlugs?.length)?.productSlugs ?? [];

    // ── Order status ──
    const orderNo = last.match(/\bGAS-?[A-Z0-9]{4,}\b/i)?.[0];
    if (orderNo || /\b(track|tracking|where is my|my order|order status)\b/.test(t)) {
      if (!orderNo) {
        yield* say(
          "Happy to check on an order. Send me your order number (it looks like GAS-XXXXXX) and the email you ordered with — or sign in and I can look it up for you. You can also use the Track order page.",
        );
        yield { type: "suggestions", items: ["Track order page", "How long does delivery take?"] };
        return;
      }
      const email = last.match(/[^\s@]+@[^\s@]+\.[^\s@]+/)?.[0];
      const res = await getOrderStatus({ order_number: orderNo.toUpperCase().replace(/^GAS(?!-)/, "GAS-"), email }, ctx);
      if ("error" in res) {
        yield* say(
          `I couldn't find ${orderNo.toUpperCase()} for your account${email ? " with that email" : ""}. Please double-check the number${ctx.userId ? "" : " and include the email you used at checkout, or sign in"}.`,
        );
        return;
      }
      yield* say(
        `Order ${res.order_number} is **${res.status.replace(/_/g, " ").toLowerCase()}** (payment: ${res.payment_status.toLowerCase()}). It contains ${res.items.join(", ")} — total ${res.total}. You can follow every update on the tracking page.`,
      );
      return;
    }

    // ── Store policies ──
    if (/\b(return|returns|refund|exchange)\b/.test(t)) {
      yield* say(
        `You have ${storePolicy.returnDays} days to return an item for a free refund. Start the return from the order in My account, or contact support and we'll sort it out.`,
      );
      return;
    }
    if (/\b(deliver|delivery|shipping|ship|arrive|how long)\b/.test(t) && !q.categories.length) {
      yield* say(
        `Most orders arrive in ${storePolicy.deliveryEstimate}, and you'll get a tracking link by email and SMS as soon as your parcel ships. Delivery is free on orders over ${formatMoney(storePolicy.freeShippingThreshold)}.`,
      );
      return;
    }
    if (/\b(pay|payment|bkash|nagad|cod|cash on delivery|card|sslcommerz)\b/.test(t) && !q.categories.length) {
      yield* say(
        `You can pay with ${listJoin(storePolicy.paymentMethods.map((m) => m.label.replace("Credit / debit card", "credit/debit cards")))}. Online payments go through SSLCommerz, so your card and wallet details never touch our servers.`,
      );
      return;
    }
    if (/\bwarranty|guarantee\b/.test(t)) {
      yield* say(`Products come with a ${storePolicy.warrantyYears}-year warranty. Keep your order number handy if you ever need to claim.`);
      return;
    }
    if (/\b(what can you|how can you help|who are you|what do you do)\b/.test(t)) {
      yield* say(faqs.find((f) => f.id === "ai-help")!.answer);
      yield { type: "suggestions", items: ["Running shoes under ৳18,000", "Compare these 2 earbuds", "Gift for dad under ৳12,000"] };
      return;
    }

    // ── Compare ──
    if (/\b(compare|vs\.?|versus|difference|which is better)\b/.test(t)) {
      let pool = mentioned(products, t);
      if (pool.length < 2 && ctx.productSlug && !pool.some((p) => p.slug === ctx.productSlug)) {
        const here = products.find((p) => p.slug === ctx.productSlug);
        if (here) pool = [here, ...pool];
      }
      if (pool.length < 2 && !q.categories.length && previous.length >= 2) {
        pool = previous.map((s) => products.find((p) => p.slug === s)).filter((p): p is ProductSummary => !!p);
      }
      if (pool.length < 2 && q.categories.length) {
        const extra = products.filter((p) => q.categories.some((c) => p.categories.some((pc) => pc.slug === c)));
        if (/earbud|buds/.test(t)) extra.sort((a) => (a.slug.includes("buds") ? -1 : 1));
        pool = [...pool, ...extra.filter((e) => !pool.includes(e))];
      }
      pool = pool.slice(0, 2);
      if (pool.length < 2) {
        yield* say("Tell me which two products you'd like to compare — for example “compare Aero Runner X and Cloud Stride 2”.");
        return;
      }
      const res = await compareProducts(pool.map((p) => p.slug));
      if ("error" in res) {
        yield* say(res.error);
        return;
      }
      const [a, b] = pool;
      const cheaper = a.price <= b.price ? a : b;
      const better = (a.rating?.average ?? 0) >= (b.rating?.average ?? 0) ? a : b;
      yield* say(
        `Here's ${a.name} vs ${b.name} side by side. ${cheaper.name} is the better value at ${formatMoney(cheaper.price)}${better.rating ? `, while ${better.name} has the higher rating (★ ${better.rating.average})` : ""}.`,
      );
      yield { type: "comparison", data: res.table };
      yield { type: "products", items: await buildPicks(pool.map((p) => ({ slug: p.slug, size: q.size }))) };
      return;
    }

    // ── Follow-ups on the previous picks ("show me in black", "in size 41", "cheaper") ──
    if (previous.length && (q.color || q.size || /\b(cheaper|less expensive|budget)\b/.test(t)) && !q.categories.length) {
      let prev = products.filter((p) => previous.includes(p.slug));
      if (/\bcheaper|less expensive|budget\b/.test(t)) {
        const max = Math.min(...prev.map((p) => p.price));
        const cats = new Set(prev.flatMap((p) => p.categories.map((c) => c.slug)));
        prev = products.filter((p) => p.price < max && p.categories.some((c) => cats.has(c.slug)));
        if (!prev.length) {
          yield* say("Those were already the most affordable options I have in that category.");
          return;
        }
      }
      const picks = await buildPicks(prev.map((p) => ({ slug: p.slug, size: rememberedSize, color: q.color })));
      const full = await commerce.getProductsByIds(picks.map((pk) => pk.product.id));
      const hasColor = (slug: string) =>
        !!full
          .find((f) => f.slug === slug)
          ?.options.find((o) => o.name === "Color")
          ?.values.some((v) => v.label.toLowerCase().includes(q.color!.replace("gray", "grey")));
      const colorHit = q.color ? picks.filter((pk) => hasColor(pk.product.slug)) : [];
      if (q.color && !colorHit.length) {
        yield* say(`None of those come in ${q.color} right now. Here they are again in the colours we have — tap one to see all options.`);
      } else {
        yield* say(
          q.color
            ? `${colorHit.map((c) => c.product.name).join(" and ")} ${colorHit.length === 1 ? "comes" : "come"} in ${q.color}${rememberedSize ? ` — I've selected EU ${rememberedSize}` : ""}.${colorHit.length < picks.length ? " The others aren't available in that colour." : ""}`
            : `Updated picks${rememberedSize ? ` in EU ${rememberedSize}` : ""}:`,
        );
      }
      yield { type: "products", items: q.color && colorHit.length ? colorHit : picks };
      return;
    }

    // ── Specific product question ──
    const named = mentioned(products, t);
    if (named.length === 1 && !/\b(gift|recommend|under|below)\b/.test(t)) {
      const p = named[0];
      const full = await commerce.getProduct(p.slug);
      const sizes = full?.options.find((o) => o.name === "Size")?.values.map((v) => v.label);
      yield* say(
        `${p.name} is ${priceLine(p)}${p.rating ? `, rated ★ ${p.rating.average} by ${p.rating.count} customers` : ""}.${p.highlights.length ? ` ${p.highlights.join(" · ")}.` : ""}${sizes ? ` Available in EU ${sizes.join(", ")}.` : ""} ${p.inStock ? "It's in stock." : "It's currently sold out."}`,
      );
      yield { type: "products", items: await buildPicks([{ slug: p.slug, size: q.size, color: q.color }]) };
      return;
    }

    // ── Recommendations ──
    let cats = q.categories;
    let intro = "";
    if (/\bworkout|gym|training|fitness\b/.test(t)) {
      cats = ["footwear", "audio", "electronics"];
      intro = "For a workout set-up I'd pair light running shoes, secure earbuds and a fitness watch:";
    } else if (/\breading corner|cosy|cozy|unwind|relax\b/.test(t)) {
      cats = ["home-living", "audio"];
      intro = "For a cosy reading corner, start with a comfy lounge chair and add a small speaker for background music:";
    } else if (/\bgift|present|birthday\b/.test(t) && !cats.length) {
      cats = ["electronics", "audio", "fashion", "beauty"];
    }

    const wantsProducts = cats.length || q.maxPrice || q.minPrice || /\b(recommend|suggest|looking for|need|want|find|show|best|gift|buy)\b/.test(t);
    if (!wantsProducts) {
      yield* say(
        "Hi! I'm GASENOS AI. Tell me what you're shopping for in your own words — a budget, who it's for, your size — and I'll find matching products, compare them and add them to your cart.",
      );
      yield { type: "suggestions", items: ["Running shoes under ৳18,000, EU 42", "Best earbuds for the gym", "Gift for dad under ৳12,000"] };
      return;
    }

    const maxMinor = q.maxPrice ? q.maxPrice * 100 : undefined;
    const minMinor = q.minPrice ? q.minPrice * 100 : undefined;
    let matches = products.filter(
      (p) =>
        (!cats.length || p.categories.some((c) => cats.includes(c.slug))) &&
        (maxMinor == null || p.price <= maxMinor) &&
        (minMinor == null || p.price >= minMinor) &&
        p.inStock,
    );
    if (/earbud|buds/.test(t)) matches = matches.filter((p) => /buds|earbud/i.test(p.name + p.slug)).concat(matches.filter((p) => !/buds|earbud/i.test(p.name + p.slug)));
    if (/headphone/.test(t)) matches.sort((a) => (a.slug.includes("headphones") ? -1 : 1));

    // Workout/reading combos: one best item per category, preferring the right kind of product.
    if (intro) {
      const prefer: Record<string, RegExp> = /\bworkout|gym|training|fitness\b/.test(t)
        ? { audio: /buds/, electronics: /watch/, footwear: /runner|stride|pace/ }
        : { audio: /speaker/, "home-living": /chair/ };
      const used = new Set<string>();
      const combo: ProductSummary[] = [];
      for (const cat of cats) {
        const inCat = matches.filter((p) => !used.has(p.id) && p.categories.some((c) => c.slug === cat));
        const pick = inCat.find((p) => prefer[cat]?.test(p.slug)) ?? inCat[0];
        if (pick) {
          used.add(pick.id);
          combo.push(pick);
        }
      }
      matches = combo;
    } else {
      matches.sort((a, b) => (b.rating?.average ?? 0) - (a.rating?.average ?? 0) || a.price - b.price);
    }
    matches = matches.slice(0, 3);

    if (!matches.length) {
      const budget = q.maxPrice ? ` under ${formatMoney(q.maxPrice * 100)}` : "";
      yield* say(
        `I couldn't find anything${budget} that matches right now. Want me to widen the budget or look in another category?`,
      );
      yield { type: "suggestions", items: ["Show me best sellers", "What's on sale?"] };
      return;
    }

    const budgetText = q.maxPrice ? ` within your ${formatMoney(q.maxPrice * 100)} budget` : "";
    const sizeText = q.size ? ` in EU ${q.size}` : "";
    const top = matches[0];
    const topNote = top.compareAtPrice && top.compareAtPrice > top.price ? ` — and it's ${Math.round(((top.compareAtPrice - top.price) / top.compareAtPrice) * 100)}% off today` : "";
    const why = top.highlights.length ? top.highlights.join(", ").toLowerCase() : top.rating ? `rated ★ ${top.rating.average} by ${top.rating.count} customers` : "a great fit";
    yield* say(
      intro ||
        `Here ${matches.length === 1 ? "is 1 pick" : `are ${matches.length} picks`}${sizeText}${budgetText}. Top pick: the ${top.name} — ${why}${topNote}.`,
    );
    yield {
      type: "products",
      items: await buildPicks(
        matches.map((p) => ({
          slug: p.slug,
          size: rememberedSize,
          color: q.color,
          reason: [p.highlights.join(" · "), p.compareAtPrice && p.compareAtPrice > p.price ? "on sale" : "", p.inStock ? "in stock" : ""]
            .filter(Boolean)
            .join(" · "),
        })),
      ),
    };
    if (q.categories.includes("footwear") && !q.size) yield { type: "suggestions", items: ["I'm EU 42", "Show me in black", "Compare the top 2"] };
  },
};
