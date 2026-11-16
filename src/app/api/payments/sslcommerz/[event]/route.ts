import { NextResponse } from "next/server";
import { sslcommerzProvider } from "@/lib/payments/sslcommerz";
import { markPaymentFailed, markPaymentSucceeded } from "@/lib/orders/service";
import { orderToken } from "@/lib/orders/access";
import { db } from "@/lib/db";
import { site } from "@/content/site";

/**
 * SSLCommerz callbacks: /success, /fail, /cancel (browser form POSTs) and /ipn
 * (server-to-server). Every success is re-validated with SSLCommerz's Validation API.
 */
export async function POST(req: Request, ctx: RouteContext<"/api/payments/sslcommerz/[event]">) {
  const { event } = await ctx.params;
  const form = Object.fromEntries((await req.formData()).entries()) as Record<string, string>;
  const tranId = form.tran_id;
  const payment = tranId ? await db.payment.findUnique({ where: { transactionId: tranId }, include: { order: true } }) : null;
  const orderNumber = payment?.order.orderNumber;
  const back = (path: string) => NextResponse.redirect(new URL(path, site.url), 303);

  if (!payment || !orderNumber) {
    return event === "ipn" ? Response.json({ ok: false }, { status: 404 }) : back("/checkout?payment=error");
  }

  if (event === "success" || event === "ipn") {
    const v = await sslcommerzProvider.validate(form);
    if (v.ok && v.transactionId === tranId) {
      const res = await markPaymentSucceeded(tranId, { ...v, provider: "sslcommerz" });
      if (event === "ipn") return Response.json({ ok: res.ok });
      return res.ok ? back(`/checkout/success/${orderNumber}?t=${orderToken(orderNumber)}`) : back(`/checkout/payment-failed/${orderNumber}?t=${orderToken(orderNumber)}`);
    }
    // Not validated (yet). Leave pending for the IPN; never mark paid on the redirect alone.
    if (event === "ipn") {
      if (form.status === "FAILED" || form.status === "CANCELLED") await markPaymentFailed(tranId, form.status === "CANCELLED" ? "CANCELLED" : "FAILED", form);
      return Response.json({ ok: false });
    }
    return back(`/checkout/payment-failed/${orderNumber}?t=${orderToken(orderNumber)}`);
  }

  if (event === "fail" || event === "cancel") {
    await markPaymentFailed(tranId, event === "cancel" ? "CANCELLED" : "FAILED", form);
    return back(`/checkout/payment-failed/${orderNumber}?t=${orderToken(orderNumber)}&reason=${event}`);
  }

  return Response.json({ error: "Unknown event" }, { status: 404 });
}
