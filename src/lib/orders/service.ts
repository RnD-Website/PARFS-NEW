import "server-only";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import type { SessionUser } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { formatMoney } from "@/lib/utils/money";
import { normalisePhone } from "@/lib/utils/phone";
import { site, storePolicy } from "@/content/site";
import { priceCart, shippingFor, type IncomingLine } from "./pricing";
import type { CheckoutInput } from "./schemas";
import { orderToken } from "./access";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const code = (n: number) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");
export const newOrderNumber = () => `GAS-${code(6)}`;
export const newTransactionId = (orderNumber: string) => `${orderNumber}-${code(4)}`;

export class CheckoutError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/**
 * Creates an order from the shopper's cart. Prices and stock come from the database
 * (never the browser); stock is reserved atomically so two shoppers can't buy the last
 * unit. Online payments start as PENDING until the gateway confirms.
 */
export async function createOrder(details: CheckoutInput, lines: IncomingLine[], user: SessionUser | null) {
  const priced = await priceCart(lines);
  if (!priced.lines.length) throw new CheckoutError("Your cart is empty or the items are no longer available.");
  if (priced.removed.length || priced.lines.some((l) => l.adjusted)) {
    throw new CheckoutError("Some items in your cart changed (price or stock). Please review your cart and try again.", 409);
  }

  const shippingFee = shippingFor(priced.subtotal, details.deliveryMethod);
  const total = priced.subtotal + shippingFee;
  const isCod = details.paymentMethod === "COD";
  const phone = normalisePhone(details.phone);
  const address = {
    fullName: details.name,
    phone,
    line1: details.line1,
    line2: details.line2 || null,
    area: details.area || null,
    city: details.city,
    district: details.district,
    postalCode: details.postalCode || null,
    country: "BD",
  };
  const delivery = storePolicy.deliveryMethods.find((d) => d.id === details.deliveryMethod)!;

  for (let attempt = 0; attempt < 3; attempt++) {
    const orderNumber = newOrderNumber();
    try {
      const order = await db.$transaction(async (tx) => {
        for (const l of priced.lines) {
          const res = await tx.variant.updateMany({
            where: { id: l.variantId, stock: { gte: l.quantity } },
            data: { stock: { decrement: l.quantity } },
          });
          if (res.count !== 1) throw new CheckoutError(`Sorry — ${l.name} just sold out in that option.`, 409);
        }
        return tx.order.create({
          data: {
            orderNumber,
            userId: user?.id ?? null,
            email: details.email,
            phone,
            customerName: details.name,
            shippingAddress: address,
            deliveryMethod: delivery.label,
            paymentMethod: details.paymentMethod,
            paymentStatus: isCod ? "UNPAID" : "PENDING",
            status: isCod ? "CONFIRMED" : "PENDING",
            currency: "BDT",
            subtotal: priced.subtotal,
            shippingFee,
            total,
            notes: details.notes || null,
            items: {
              create: priced.lines.map((l) => ({
                productId: l.productId,
                variantId: l.variantId,
                name: l.name,
                slug: l.slug,
                image: l.image,
                options: l.options,
                unitPrice: l.unitPrice,
                quantity: l.quantity,
              })),
            },
            events: {
              create: [
                { status: "PENDING", note: "Order placed" },
                ...(isCod ? [{ status: "CONFIRMED" as const, note: "Confirmed — pay cash on delivery" }] : []),
              ],
            },
          },
          include: { items: true },
        });
      });

      if (user && details.saveAddress) {
        const exists = await db.address.findFirst({ where: { userId: user.id, line1: address.line1, city: address.city } });
        if (!exists) {
          const count = await db.address.count({ where: { userId: user.id } });
          await db.address.create({ data: { ...address, userId: user.id, isDefault: count === 0 } });
        }
      }

      if (isCod) await sendOrderConfirmation(order.orderNumber);
      return order;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") continue; // order number clash
      throw e;
    }
  }
  throw new CheckoutError("Could not create the order. Please try again.", 500);
}

/** Puts reserved stock back (failed / cancelled online payment). */
async function releaseStock(orderId: string) {
  const items = await db.orderItem.findMany({ where: { orderId } });
  for (const i of items) {
    if (i.variantId) await db.variant.updateMany({ where: { id: i.variantId }, data: { stock: { increment: i.quantity } } });
  }
}

export async function markPaymentSucceeded(transactionId: string, v: { validationId: string; amount: number; currency: string; raw: unknown; provider: string }) {
  const payment = await db.payment.findUnique({ where: { transactionId }, include: { order: true } });
  if (!payment) return { ok: false as const, reason: "Unknown transaction" };
  if (payment.status === "PAID") return { ok: true as const, order: payment.order }; // idempotent (success URL + IPN)
  if (v.amount !== payment.amount || v.currency !== payment.currency) {
    await db.payment.update({ where: { id: payment.id }, data: { status: "FAILED", raw: v.raw as object } });
    return { ok: false as const, reason: "Amount mismatch", order: payment.order };
  }
  const order = await db.$transaction(async (tx) => {
    await tx.payment.update({ where: { id: payment.id }, data: { status: "PAID", validationId: v.validationId, raw: v.raw as object } });
    return tx.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: "PAID",
        status: "CONFIRMED",
        events: { create: { status: "CONFIRMED", note: `Payment received via ${payment.order.paymentMethod === "CARD" ? "card" : payment.order.paymentMethod.toLowerCase()}` } },
      },
    });
  });
  await sendOrderConfirmation(order.orderNumber);
  return { ok: true as const, order };
}

export async function markPaymentFailed(transactionId: string, status: "FAILED" | "CANCELLED", raw?: unknown) {
  const payment = await db.payment.findUnique({ where: { transactionId }, include: { order: true } });
  if (!payment || payment.status === "PAID") return payment?.order ?? null;
  if (payment.status === "FAILED" || payment.status === "CANCELLED") return payment.order;
  await db.payment.update({ where: { id: payment.id }, data: { status, raw: (raw ?? undefined) as object | undefined } });
  const order = await db.order.update({
    where: { id: payment.orderId },
    data: {
      paymentStatus: status,
      status: "CANCELLED",
      events: { create: { status: "CANCELLED", note: status === "CANCELLED" ? "Payment cancelled" : "Payment failed" } },
    },
  });
  await releaseStock(order.id);
  return order;
}

export async function sendOrderConfirmation(orderNumber: string) {
  const order = await db.order.findUnique({ where: { orderNumber }, include: { items: true } });
  if (!order) return;
  const link = `${site.url}/track-order?order=${order.orderNumber}&t=${orderToken(order.orderNumber)}`;
  const lines = order.items.map((i) => `• ${i.quantity} × ${i.name} — ${formatMoney(i.unitPrice * i.quantity, order.currency)}`).join("\n");
  await sendEmail({
    to: order.email,
    subject: `Order ${order.orderNumber} confirmed`,
    text: `Hi ${order.customerName},\n\nThanks for shopping with GASENOS! Your order ${order.orderNumber} is confirmed.\n\n${lines}\n\nDelivery: ${formatMoney(order.shippingFee, order.currency)}\nTotal: ${formatMoney(order.total, order.currency)}\nPayment: ${order.paymentMethod === "COD" ? "Cash on delivery" : "Paid online"}\n\nTrack your order: ${link}\n\n— GASENOS`,
  });
}
