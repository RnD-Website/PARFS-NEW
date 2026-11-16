import { db } from "@/lib/db";
import { trackSchema } from "@/lib/orders/schemas";
import { orderToken } from "@/lib/orders/access";
import { checkMutation, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

/** Guest order lookup: order number + checkout email → signed tracking link. */
export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  if (!rateLimit(`track:${clientIp(req.headers)}`, 10, 10 * 60_000).ok) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const parsed = trackSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Enter your order number and email." }, { status: 400 });
  const orderNumber = parsed.data.orderNumber.toUpperCase().replace(/^GAS(?!-)/, "GAS-");
  const order = await db.order.findUnique({ where: { orderNumber }, select: { orderNumber: true, email: true } });
  if (!order || order.email.toLowerCase() !== parsed.data.email) {
    return Response.json({ error: "We couldn't find an order with that number and email." }, { status: 404 });
  }
  return Response.json({ redirectUrl: `/track-order?order=${order.orderNumber}&t=${orderToken(order.orderNumber)}` });
}
