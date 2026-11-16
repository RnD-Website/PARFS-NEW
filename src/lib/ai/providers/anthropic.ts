import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AIEvent, AIProvider, ChatContext, ChatTurn } from "../types";
import {
  buildPicks,
  compareInput,
  compareProducts,
  getOrderStatus,
  getPolicy,
  getProductDetails,
  orderInput,
  policyInput,
  searchInput,
  searchProducts,
  showInput,
  slugInput,
} from "../tools";
import { SYSTEM_PROMPT } from "../system-prompt";

/**
 * GASENOS AI on Claude. Enable with AI_PROVIDER=anthropic and ANTHROPIC_API_KEY.
 * Manual streaming tool loop: text streams to the shopper while tools query the live
 * catalogue; product cards / comparisons are emitted as structured events.
 */

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
// Chat answers don't need deep reasoning; raise via env if quality calls for it.
const EFFORT = (process.env.AI_EFFORT || "low") as "low" | "medium" | "high" | "xhigh" | "max";
const MAX_TOOL_ROUNDS = 6;

const tools: Anthropic.Beta.Messages.BetaTool[] = [
  {
    name: "search_products",
    description:
      "Search the GASENOS catalogue. Use for any request to find, recommend or browse products. Prices are in BDT (৳). Returns facts for matching products only — never describe products not returned here.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Keywords, e.g. 'running shoes', 'earbuds', 'serum'." },
        category: { type: "string", enum: ["electronics", "fashion", "home-living", "beauty", "footwear", "audio"] },
        min_price_bdt: { type: "number" },
        max_price_bdt: { type: "number", description: "Budget ceiling in taka." },
        on_sale: { type: "boolean" },
        sort: { type: "string", enum: ["featured", "price-asc", "price-desc", "rating", "newest"] },
        limit: { type: "integer", minimum: 1, maximum: 12 },
      },
    },
  },
  {
    name: "get_product_details",
    description: "Get full details (price, sizes, colours, rating, stock, highlights) for one product by slug.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  },
  {
    name: "compare_products",
    description: "Compare 2–4 products side by side. Shows a comparison table to the shopper.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { slugs: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 } },
      required: ["slugs"],
    },
  },
  {
    name: "show_products",
    description:
      "Display product cards (with add-to-cart) to the shopper. Call this whenever you recommend specific products. Include a short reason per pick and the shopper's size/colour if known so the right variant is pre-selected.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        picks: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              slug: { type: "string" },
              reason: { type: "string", description: "≤ 12 words, e.g. 'Lightest pick · 20% off · in stock'." },
              size: { type: "string", description: "EU size, e.g. '42'." },
              color: { type: "string" },
            },
            required: ["slug"],
          },
        },
      },
      required: ["picks"],
    },
  },
  {
    name: "get_store_policy",
    description: "Official GASENOS policy text for shipping, delivery time, returns, payment methods, warranty, or the FAQ.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { topic: { type: "string", enum: ["shipping", "delivery_time", "returns", "payment", "warranty", "faq"] } },
      required: ["topic"],
    },
  },
  {
    name: "get_order_status",
    description:
      "Look up an order's status. Requires the order number (GAS-XXXXXX). Unless the shopper is signed in, also requires the email used at checkout — ask for it rather than guessing.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { order_number: { type: "string" }, email: { type: "string" } },
      required: ["order_number"],
    },
  },
];

type ToolOutput = { result: unknown; events: AIEvent[] };

async function runTool(name: string, raw: unknown, ctx: ChatContext): Promise<ToolOutput> {
  const parse = <T extends z.ZodTypeAny>(schema: T) => schema.parse(raw) as z.infer<T>;
  switch (name) {
    case "search_products":
      return { result: await searchProducts(parse(searchInput)), events: [{ type: "status", label: "Searching the catalogue…" }] };
    case "get_product_details":
      return { result: await getProductDetails(parse(slugInput).slug), events: [] };
    case "compare_products": {
      const res = await compareProducts(parse(compareInput).slugs);
      if ("error" in res) return { result: res, events: [] };
      return { result: res.facts, events: [{ type: "comparison", data: res.table }] };
    }
    case "show_products": {
      const picks = await buildPicks(parse(showInput).picks);
      return {
        result: { shown: picks.map((p) => ({ slug: p.product.slug, preselected_variant: p.variant?.title ?? null })) },
        events: picks.length ? [{ type: "products", items: picks }] : [],
      };
    }
    case "get_store_policy":
      return { result: getPolicy(parse(policyInput).topic), events: [] };
    case "get_order_status":
      return { result: await getOrderStatus(parse(orderInput), ctx), events: [] };
    default:
      return { result: { error: `Unknown tool ${name}` }, events: [] };
  }
}

function toMessages(turns: ChatTurn[], ctx: ChatContext): Anthropic.Beta.Messages.BetaMessageParam[] {
  const msgs: Anthropic.Beta.Messages.BetaMessageParam[] = turns.map((t) => ({
    role: t.role,
    content:
      t.role === "assistant" && t.productSlugs?.length
        ? `${t.text}\n\n[Products shown to the shopper: ${t.productSlugs.join(", ")}]`
        : t.text,
  }));
  // Per-request context rides on the latest user turn so the system prompt stays cacheable.
  const notes = [
    ctx.productSlug ? `The shopper is viewing the product page for slug "${ctx.productSlug}".` : null,
    ctx.userId ? "The shopper is signed in (their own orders can be looked up without an email)." : "The shopper is not signed in.",
  ].filter(Boolean);
  const last = msgs.at(-1);
  if (last && last.role === "user" && typeof last.content === "string") {
    last.content = [
      { type: "text", text: `<context>${notes.join(" ")}</context>` },
      { type: "text", text: last.content },
    ];
  }
  return msgs;
}

export const anthropicProvider: AIProvider = {
  name: "anthropic",
  async *respond(turns, ctx) {
    const client = new Anthropic();
    const messages = toMessages(turns, ctx);
    let jsonRetries = 0;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
        tools,
        messages,
        output_config: { effort: EFFORT },
        // Server-side refusal fallback: a declined request is re-run on a fallback model.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });

      let message: Anthropic.Beta.Messages.BetaMessage;
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            yield { type: "text", delta: event.delta.text };
          }
        }
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
        continue; // unparseable streamed tool input — re-issue the turn
      }

      if (message.stop_reason === "refusal") {
        yield { type: "text", delta: "\n\nSorry — I can't help with that one. Is there something else you're shopping for?" };
        return;
      }
      if (message.stop_reason === "end_turn") return;
      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }

      const toolUses = message.content.filter(
        (b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use",
      );
      if (!toolUses.length) return;
      if (message.stop_reason === "max_tokens") throw new Error("Tool input truncated (max_tokens)");

      messages.push({ role: "assistant", content: message.content });
      const results: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = [];
      // Run tools concurrently; return all results in one user message.
      const outputs = await Promise.all(
        toolUses.map(async (tu) => {
          try {
            return { tu, out: await runTool(tu.name, tu.input, ctx), error: null as string | null };
          } catch (e) {
            const msg = e instanceof z.ZodError ? `INVALID_INPUT: ${e.issues.map((i) => i.message).join("; ")}` : "Tool failed";
            return { tu, out: null, error: msg };
          }
        }),
      );
      for (const { tu, out, error } of outputs) {
        if (out) for (const ev of out.events) yield ev;
        results.push({
          type: "tool_result",
          tool_use_id: tu.id,
          content: error ?? JSON.stringify(out!.result),
          is_error: error ? true : undefined,
        });
      }
      messages.push({ role: "user", content: results });
    }
  },
};
