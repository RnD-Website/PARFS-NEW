import { z } from "zod";
import { getAIProvider } from "@/lib/ai";
import type { AIEvent } from "@/lib/ai/types";
import { getCurrentUser } from "@/lib/auth/session";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const bodySchema = z.object({
  turns: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().max(4000),
        productSlugs: z.array(z.string().max(120)).max(12).optional(),
      }),
    )
    .min(1)
    .max(30),
  context: z.object({ productSlug: z.string().max(120).optional() }).optional(),
});

export async function POST(req: Request) {
  const limit = rateLimit(`ai:${clientIp(req.headers)}`, 20, 60_000);
  if (!limit.ok) {
    return Response.json({ error: "Too many messages — please wait a moment." }, { status: 429, headers: { "retry-after": String(limit.retryAfter) } });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success || parsed.data.turns.at(-1)?.role !== "user" || !parsed.data.turns.at(-1)?.text.trim()) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = await getCurrentUser();
  const provider = getAIProvider();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: AIEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
      try {
        for await (const event of provider.respond(parsed.data.turns, {
          productSlug: parsed.data.context?.productSlug,
          userId: user?.id ?? null,
          userEmail: user?.email ?? null,
        })) {
          send(event);
        }
      } catch (err) {
        console.error("[ai] provider error", err);
        send({ type: "error", message: "The Concierge is unavailable for a moment. Please try again shortly." });
      } finally {
        send({ type: "done" });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-ai-provider": provider.name,
    },
  });
}
