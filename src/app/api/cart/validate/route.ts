import { z } from "zod";
import { priceCart } from "@/lib/orders/pricing";

const schema = z.object({
  lines: z.array(z.object({ variantId: z.string().min(1).max(64), quantity: z.number().int().min(1).max(99) })).max(50),
});

/** Returns authoritative prices & stock for the client cart. */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid cart" }, { status: 400 });
  const result = await priceCart(parsed.data.lines);
  return Response.json(result, { headers: { "cache-control": "no-store" } });
}
