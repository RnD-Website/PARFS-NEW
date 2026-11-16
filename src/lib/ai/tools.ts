import "server-only";
import { z } from "zod";
import { commerce, toSummary } from "@/lib/commerce";
import type { Product } from "@/lib/commerce/types";
import { db } from "@/lib/db";
import { formatMoney, toMinor } from "@/lib/utils/money";
import { storePolicy } from "@/content/site";
import { faqs } from "@/content/faq";
import type { AIComparison, AIProductPick, ChatContext } from "./types";

/**
 * The assistant's capabilities. Both the mock provider and the Claude provider call
 * these, so answers are always grounded in the live catalogue and store policy —
 * the assistant can never present a product that doesn't exist.
 */

// ───────────── Schemas (shared with the Claude tool definitions) ─────────────

export const searchInput = z.object({
  query: z.string().max(200).optional(),
  category: z.enum(["electronics", "fashion", "home-living", "beauty", "footwear", "audio"]).optional(),
  min_price_bdt: z.number().nonnegative().optional(),
  max_price_bdt: z.number().positive().optional(),
  on_sale: z.boolean().optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "rating", "newest"]).optional(),
  limit: z.number().int().min(1).max(12).optional(),
});

export const slugInput = z.object({ slug: z.string().min(1).max(120) });
export const compareInput = z.object({ slugs: z.array(z.string().min(1).max(120)).min(2).max(4) });
export const showInput = z.object({
  picks: z
    .array(
      z.object({
        slug: z.string().min(1).max(120),
        reason: z.string().max(160).optional(),
        size: z.string().max(10).optional(),
        color: z.string().max(40).optional(),
      }),
    )
    .min(1)
    .max(6),
});
export const policyInput = z.object({
  topic: z.enum(["shipping", "delivery_time", "returns", "payment", "warranty", "faq"]),
});
export const orderInput = z.object({
  order_number: z.string().min(4).max(40),
  email: z.string().max(200).optional(),
});

// ───────────── Helpers ─────────────

function productFacts(p: Product) {
  const sizes = p.options.find((o) => o.name === "Size")?.values.map((v) => v.label);
  const colors = p.options.find((o) => o.name === "Color")?.values.map((v) => v.label);
  return {
    slug: p.slug,
    name: p.name,
    categories: p.categories.map((c) => c.name),
    price: formatMoney(p.price, p.currency),
    compare_at_price: p.compareAtPrice ? formatMoney(p.compareAtPrice, p.currency) : null,
    on_sale: !!p.compareAtPrice && p.compareAtPrice > p.price,
    rating: p.rating ? `${p.rating.average} (${p.rating.count} reviews)` : null,
    in_stock: p.inStock,
    highlights: p.highlights,
    description: p.description,
    sizes: sizes ?? null,
    colors: colors ?? null,
    attributes: p.attributes,
    tags: p.tags,
    url: `/products/${p.slug}`,
  };
}

function pickVariant(p: Product, size?: string, color?: string) {
  if (!p.options.length) return null;
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const sizeOpt = p.options.find((o) => o.name === "Size");
  const colorOpt = p.options.find((o) => o.name === "Color");
  const sizeValue = size ? sizeOpt?.values.find((v) => norm(v.value) === norm(size))?.value : undefined;
  if (sizeOpt && !sizeValue) return null; // can't pre-select without a size
  const wantedColor = color
    ? colorOpt?.values.find((v) => norm(v.label) === norm(color) || norm(v.value) === norm(color))?.value
    : undefined;
  const matches = p.variants.filter(
    (v) => (!sizeOpt || v.options.Size === sizeValue) && (!wantedColor || v.options.Color === wantedColor),
  );
  // With no colour requested, default to the first in-stock colour in display order (the design's default swatch).
  const colorOrder = colorOpt?.values.map((v) => v.value) ?? [];
  matches.sort((a, b) => colorOrder.indexOf(a.options.Color) - colorOrder.indexOf(b.options.Color));
  const chosen = matches.find((v) => v.stock > 0) ?? matches[0];
  return chosen ? { id: chosen.id, title: chosen.title, stock: chosen.stock } : null;
}

// ───────────── Tools ─────────────

export async function searchProducts(input: z.infer<typeof searchInput>) {
  const page = await commerce.getProducts({
    search: input.query,
    category: input.category,
    minPrice: input.min_price_bdt != null ? toMinor(input.min_price_bdt) : undefined,
    maxPrice: input.max_price_bdt != null ? toMinor(input.max_price_bdt) : undefined,
    onSale: input.on_sale,
    sort: input.sort ?? "featured",
    pageSize: input.limit ?? 6,
  });
  const full = await commerce.getProductsByIds(page.items.map((i) => i.id));
  const bySlug = new Map(full.map((p) => [p.slug, p]));
  return {
    total_matches: page.total,
    products: page.items.map((i) => productFacts(bySlug.get(i.slug)!)),
  };
}

export async function getProductDetails(slug: string) {
  const p = await commerce.getProduct(slug);
  return p ? productFacts(p) : { error: `No product with slug "${slug}"` };
}

export async function compareProducts(slugs: string[]): Promise<{ table: AIComparison; facts: unknown[] } | { error: string }> {
  const products = (await Promise.all(slugs.map((s) => commerce.getProduct(s)))).filter((p): p is Product => !!p);
  if (products.length < 2) return { error: "Need at least two valid products to compare." };
  const rows: AIComparison["rows"] = [
    { label: "Price", values: products.map((p) => formatMoney(p.price, p.currency)) },
    {
      label: "Was",
      values: products.map((p) => (p.compareAtPrice && p.compareAtPrice > p.price ? formatMoney(p.compareAtPrice, p.currency) : "—")),
    },
    { label: "Rating", values: products.map((p) => (p.rating ? `★ ${p.rating.average} (${p.rating.count})` : "No ratings yet")) },
    { label: "Category", values: products.map((p) => p.categories.map((c) => c.name).join(", ")) },
    { label: "Highlights", values: products.map((p) => p.highlights.join(" · ") || "—") },
    { label: "Availability", values: products.map((p) => (p.inStock ? "In stock" : "Sold out")) },
  ];
  return {
    table: { products: products.map((p) => ({ slug: p.slug, name: p.name })), rows },
    facts: products.map(productFacts),
  };
}

export async function buildPicks(picks: z.infer<typeof showInput>["picks"]): Promise<AIProductPick[]> {
  const out: AIProductPick[] = [];
  for (const pick of picks) {
    const p = await commerce.getProduct(pick.slug);
    if (!p) continue;
    const v = pickVariant(p, pick.size, pick.color);
    out.push({ product: toSummary(p), reason: pick.reason, variant: v ? { id: v.id, title: v.title } : null });
  }
  return out;
}

export function getPolicy(topic: z.infer<typeof policyInput>["topic"]) {
  const threshold = formatMoney(storePolicy.freeShippingThreshold);
  switch (topic) {
    case "shipping":
      return {
        free_delivery: `Free delivery on orders over ${threshold}.`,
        methods: storePolicy.deliveryMethods.map((m) => `${m.label}: ${m.description}, ${formatMoney(m.fee)} (free over ${threshold})`),
        tracking: "A tracking link is sent by email and SMS as soon as the parcel ships.",
        page: "/policies/shipping",
      };
    case "delivery_time":
      return { estimate: `Most orders arrive in ${storePolicy.deliveryEstimate}.`, page: "/policies/shipping" };
    case "returns":
      return { window: `${storePolicy.returnDays}-day free returns.`, how: "Start a return from the order in My account, or contact support.", page: "/policies/returns" };
    case "payment":
      return {
        methods: storePolicy.paymentMethods.map((m) => `${m.label} — ${m.description}`),
        processor: "Online payments are processed securely by SSLCommerz.",
      };
    case "warranty":
      return { warranty: `${storePolicy.warrantyYears}-year warranty.`, page: "/policies/warranty" };
    case "faq":
      return { faqs: faqs.map((f) => ({ q: f.question, a: f.answer })) };
  }
}

/** Order lookup — only for the signed-in owner, or when the order email matches. */
export async function getOrderStatus(input: z.infer<typeof orderInput>, ctx: ChatContext) {
  const order = await db.order.findUnique({
    where: { orderNumber: input.order_number.trim().toUpperCase() },
    include: { items: true, events: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  const owns =
    order &&
    ((ctx.userId && order.userId === ctx.userId) ||
      (input.email && order.email.toLowerCase() === input.email.trim().toLowerCase()) ||
      (ctx.userEmail && order.email.toLowerCase() === ctx.userEmail.toLowerCase()));
  if (!order || !owns) {
    return {
      error:
        "No order found for that number and email. Ask the customer to double-check, sign in, or use the Track order page.",
      page: "/track-order",
    };
  }
  return {
    order_number: order.orderNumber,
    status: order.status,
    payment_status: order.paymentStatus,
    payment_method: order.paymentMethod,
    total: formatMoney(order.total, order.currency),
    placed: order.createdAt.toISOString().slice(0, 10),
    items: order.items.map((i) => `${i.quantity} × ${i.name}`),
    last_update: order.events[0]?.note ?? null,
    page: `/track-order?order=${order.orderNumber}`,
  };
}
