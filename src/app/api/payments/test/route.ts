import { z } from "zod";
import { mockPaymentProvider } from "@/lib/payments/mock";
import { paymentTestMode } from "@/lib/payments";
import { markPaymentFailed, markPaymentSucceeded } from "@/lib/orders/service";
import { orderToken } from "@/lib/orders/access";
import { db } from "@/lib/db";
import { checkMutation, readJson } from "@/lib/security/request";

const schema = z.object({ tran: z.string().min(4).max(64), amount: z.string().regex(/^\d+$/), sig: z.string().min(8).max(64), outcome: z.enum(["success", "fail", "cancel"]) });

/** Callback for the TEST MODE payment page. Disabled when SSLCommerz is configured. */
export async function POST(req: Request) {
  if (!paymentTestMode()) return Response.json({ error: "Test payments are disabled" }, { status: 404 });
  const bad = checkMutation(req);
  if (bad) return bad;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const { tran, amount, sig, outcome } = parsed.data;
  const payment = await db.payment.findUnique({ where: { transactionId: tran }, include: { order: true } });
  if (!payment) return Response.json({ error: "Unknown transaction" }, { status: 404 });
  const on = payment.order.orderNumber;
  const t = orderToken(on);

  if (outcome === "success") {
    const v = await mockPaymentProvider.validate({ tran_id: tran, amount, sig });
    if (!v.ok) return Response.json({ error: v.reason }, { status: 400 });
    const res = await markPaymentSucceeded(tran, { ...v, provider: "mock" });
    return Response.json({ redirectUrl: res.ok ? `/checkout/success/${on}?t=${t}` : `/checkout/payment-failed/${on}?t=${t}` });
  }
  await markPaymentFailed(tran, outcome === "cancel" ? "CANCELLED" : "FAILED", { test: true });
  return Response.json({ redirectUrl: `/checkout/payment-failed/${on}?t=${t}&reason=${outcome}` });
}
