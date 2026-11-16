import type { ProductSummary } from "@/lib/commerce/types";

/** A product the assistant is presenting, with why it fits and an optional pre-selected variant. */
export type AIProductPick = {
  product: ProductSummary;
  reason?: string;
  variant?: { id: string; title: string } | null;
};

export type AIComparison = {
  products: { slug: string; name: string }[];
  rows: { label: string; values: string[] }[];
};

/** Events streamed (NDJSON) from /api/ai/chat to the UI. */
export type AIEvent =
  | { type: "text"; delta: string }
  | { type: "products"; items: AIProductPick[] }
  | { type: "comparison"; data: AIComparison }
  | { type: "suggestions"; items: string[] }
  | { type: "status"; label: string }
  | { type: "error"; message: string }
  | { type: "done" };

/** Client-side transcript entry (what the UI keeps and sends back). */
export type ChatTurn = {
  role: "user" | "assistant";
  text: string;
  /** Slugs of products shown in this assistant turn (for follow-ups like "show me in black"). */
  productSlugs?: string[];
};

export type ChatContext = {
  /** Slug of the product page the shopper is on, if any. */
  productSlug?: string;
  userId?: string | null;
  userEmail?: string | null;
};

export interface AIProvider {
  readonly name: string;
  respond(turns: ChatTurn[], context: ChatContext): AsyncIterable<AIEvent>;
}
