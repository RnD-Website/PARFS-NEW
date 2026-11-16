import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { AIEvent, AIProvider, ChatContext, ChatTurn } from "../types";
import { buildPicks, compareFragrances, compareInput, getFragrance, getPolicy, policyInput, searchFragrances, searchInput, showInput, slugInput } from "./knowledge";
import { PARFS_SYSTEM_PROMPT } from "./prompt";

/**
 * PARFS Concierge on Claude. Enable with AI_PROVIDER=anthropic and ANTHROPIC_API_KEY (or another
 * credential source the SDK resolves). Manual streaming tool loop: text streams to the shopper while
 * tools read the PARFS collection and policies; fragrance cards / comparisons arrive as events.
 */

const MODEL = process.env.AI_MODEL || "claude-opus-5-5";
// Boutique chat doesn't need deep reasoning; raise via env if quality calls for it.
const EFFORT = (process.env.AI_EFFORT || "low") as "low" | "medium" | "high" | "xhigh" | "max";
const MAX_TOOL_ROUNDS = 6;

const tools: Anthropic.Beta.Messages.BetaTool[] = [
  {
    name: "search_fragrances",
    description:
      "Search the PARFS fragrance collection. Use for any request to find, recommend or browse scents. Prices are in USD. Returns only real PARFS fragrances — never describe a scent that isn't returned here.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Notes, moods or names, e.g. 'oud leather', 'fresh citrus', 'rose'." },
        family: { type: "string", enum: ["Woody", "Floral", "Amber", "Fresh"] },
        concentration: { type: "string", enum: ["Eau de Parfum", "Extrait de Parfum"] },
        min_price_usd: { type: "number" },
        max_price_usd: { type: "number", description: "Budget ceiling in US dollars." },
        sort: { type: "string", enum: ["relevance", "price-asc", "price-desc"] },
        limit: { type: "integer", minimum: 1, maximum: 12 },
      },
    },
  },
  {
    name: "get_fragrance",
    description: "Get the details (price, family, concentration, size, notes) of one PARFS fragrance by slug.",
    eager_input_streaming: true,
    input_schema: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] },
  },
  {
    name: "compare_fragrances",
    description: "Compare 2–4 PARFS fragrances side by side. Shows a comparison table to the shopper.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: { slugs: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 } },
      required: ["slugs"],
    },
  },
  {
    name: "show_fragrances",
    description: "Present 1–6 fragrances to the shopper as cards they can add to their bag. Include a short reason for each.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        picks: {
          type: "array",
          minItems: 1,
          maxItems: 6,
          items: { type: "object", properties: { slug: { type: "string" }, reason: { type: "string" } }, required: ["slug"] },
        },
      },
      required: ["picks"],
    },
  },
  {
    name: "get_policy",
    description: "Official PARFS information on shipping, returns, payment, gifting and engraving, consultations, order tracking, fragrance care or privacy.",
    eager_input_streaming: true,
    input_schema: {
      type: "object",
      properties: {
        topic: { type: "string", enum: ["shipping", "returns", "payment", "gifting_engraving", "consultation", "order_tracking", "fragrance_care", "privacy"] },
      },
      required: ["topic"],
    },
  },
];

type ToolOutput = { result: unknown; events: AIEvent[] };

async function runTool(name: string, raw: unknown): Promise<ToolOutput> {
  const parse = <T extends z.ZodTypeAny>(schema: T) => schema.parse(raw) as z.infer<T>;
  switch (name) {
    case "search_fragrances":
      return { result: searchFragrances(parse(searchInput)), events: [{ type: "status", label: "Searching the collection…" }] };
    case "get_fragrance":
      return { result: getFragrance(parse(slugInput).slug), events: [] };
    case "compare_fragrances": {
      const res = compareFragrances(parse(compareInput).slugs);
      if ("error" in res) return { result: res, events: [] };
      return { result: res.facts, events: [{ type: "comparison", data: res.table }] };
    }
    case "show_fragrances": {
      const picks = await buildPicks(parse(showInput).picks);
      return { result: { shown: picks.map((p) => p.product.slug) }, events: picks.length ? [{ type: "products", items: picks }] : [] };
    }
    case "get_policy":
      return { result: getPolicy(parse(policyInput).topic), events: [] };
    default:
      return { result: { error: `Unknown tool ${name}` }, events: [] };
  }
}

function toMessages(turns: ChatTurn[], ctx: ChatContext): Anthropic.Beta.Messages.BetaMessageParam[] {
  const msgs: Anthropic.Beta.Messages.BetaMessageParam[] = turns.map((t) => ({
    role: t.role,
    content: t.role === "assistant" && t.productSlugs?.length ? `${t.text}\n\n[Fragrances shown: ${t.productSlugs.join(", ")}]` : t.text,
  }));
  // Per-request context rides on the latest user turn so the system prompt stays cacheable.
  const last = msgs.at(-1);
  if (ctx.productSlug && last && last.role === "user" && typeof last.content === "string") {
    last.content = [
      { type: "text", text: `<context>The shopper is viewing the product page for "${ctx.productSlug}".</context>` },
      { type: "text", text: last.content },
    ];
  }
  return msgs;
}

export const parfsClaudeProvider: AIProvider = {
  name: "anthropic",
  async *respond(turns, ctx) {
    const client = new Anthropic();
    const messages = toMessages(turns, ctx);
    let jsonRetries = 0;

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: [{ type: "text", text: PARFS_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
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
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") yield { type: "text", delta: event.delta.text };
        }
        message = await stream.finalMessage();
        jsonRetries = 0;
      } catch (err) {
        if (err instanceof Anthropic.APIError || jsonRetries++ >= 2) throw err;
        continue; // unparseable streamed tool input — re-issue the turn
      }

      if (message.stop_reason === "refusal") {
        yield { type: "text", delta: "\n\nForgive me — I can't help with that. May I help you find a fragrance instead?" };
        return;
      }
      if (message.stop_reason === "end_turn") return;
      if (message.stop_reason === "pause_turn") {
        messages.push({ role: "assistant", content: message.content });
        continue;
      }

      const toolUses = message.content.filter((b): b is Anthropic.Beta.Messages.BetaToolUseBlock => b.type === "tool_use");
      if (!toolUses.length) return;
      if (message.stop_reason === "max_tokens") throw new Error("Tool input truncated (max_tokens)");

      messages.push({ role: "assistant", content: message.content });
      const outputs = await Promise.all(
        toolUses.map(async (tu) => {
          try {
            return { tu, out: await runTool(tu.name, tu.input), error: null as string | null };
          } catch (e) {
            const msg = e instanceof z.ZodError ? `INVALID_INPUT: ${e.issues.map((i) => i.message).join("; ")}` : "Tool failed";
            return { tu, out: null, error: msg };
          }
        }),
      );
      const results: Anthropic.Beta.Messages.BetaToolResultBlockParam[] = [];
      for (const { tu, out, error } of outputs) {
        if (out) for (const ev of out.events) yield ev;
        results.push({ type: "tool_result", tool_use_id: tu.id, content: error ?? JSON.stringify(out!.result), is_error: error ? true : undefined });
      }
      // All tool results go back in one user message.
      messages.push({ role: "user", content: results });
    }
  },
};
