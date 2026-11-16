import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { checkoutRequestSchema } from "@/lib/orders/schemas";
import { CheckoutError, createOrder, markPaymentFailed, newTransactionId } from "@/lib/orders/service";
import { orderToken } from "@/lib/orders/access";
import { getPaymentProvider } from "@/lib/payments";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  if (!rateLimit(`checkout:${clientIp(req.headers)}`, 10, 10 * 60_000).ok) {
    return Response.json({ error: "Too many attempts. Please wait a moment and try again." }, { status: 429 });
  }
  const parsed = checkoutRequestSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    return Response.json(
      { error: "Please check your details.", fields: fieldErrors(parsed.error.issues.map((i) => ({ ...i, path: i.path.slice(i.path[0] === "details" ? 1 : 0) }))) },
      { status: 400 },
    );
  }
  const user = await getCurrentUser();
  const { details, lines } = parsed.data;

  let order;
  try {
    order = await createOrder(details, lines, user);
  } catch (e) {
    if (e instanceof CheckoutError) return Response.json({ error: e.message }, { status: e.status });
    console.error("[checkout] create failed", e);
    return Response.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
  }

  const token = orderToken(order.orderNumber);
  if (order.paymentMethod === "COD") {
    return Response.json({ orderNumber: order.orderNumber, redirectUrl: `/checkout/success/${order.orderNumber}?t=${token}` }, { status: 201 });
  }

  // Online payment: open a gateway session.
  const provider = getPaymentProvider();
  const transactionId = newTransactionId(order.orderNumber);
  await db.payment.create({
    data: { orderId: order.id, provider: provider.name, transactionId, amount: order.total, currency: order.currency, status: "PENDING" },
  });
  try {
    const { redirectUrl } = await provider.initiate({
      orderNumber: order.orderNumber,
      transactionId,
      amount: order.total,
      currency: order.currency,
      method: order.paymentMethod as "BKASH" | "NAGAD" | "CARD",
      customer: {
        name: order.customerName,
        email: order.email,
        phone: order.phone,
        address: [details.line1, details.line2, details.area].filter(Boolean).join(", "),
        city: details.city,
        postcode: details.postalCode,
      },
      productNames: order.items.map((i) => i.name).join(", "),
      itemCount: order.items.reduce((n, i) => n + i.quantity, 0),
    });
    return Response.json({ orderNumber: order.orderNumber, redirectUrl }, { status: 201 });
  } catch (e) {
    console.error("[checkout] payment init failed", e);
    await markPaymentFailed(transactionId, "FAILED", { error: String(e) });
    return Response.json(
      { error: "We couldn't start the online payment. Your order was not charged — please try again or choose cash on delivery." },
      { status: 502 },
    );
  }
}
