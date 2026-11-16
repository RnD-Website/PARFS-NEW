import Image from "next/image";
import Link from "next/link";
import type { Order, OrderEvent, OrderItem } from "@/generated/prisma/client";
import { formatMoney } from "@/lib/utils/money";
import { formatDate, formatDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

export type FullOrder = Order & { items: OrderItem[]; events: OrderEvent[] };

const STEPS = ["CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
const STEP_LABEL: Record<string, string> = {
  PENDING: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
const PAY_LABEL: Record<string, string> = { COD: "Cash on delivery", BKASH: "bKash", NAGAD: "Nagad", CARD: "Card" };
const PAY_STATUS: Record<string, string> = { UNPAID: "Pay on delivery", PENDING: "Awaiting payment", PAID: "Paid", FAILED: "Payment failed", CANCELLED: "Payment cancelled", REFUNDED: "Refunded" };

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold",
        status === "CANCELLED" ? "bg-danger/10 text-danger" : status === "DELIVERED" ? "bg-success/10 text-success" : status === "PENDING" ? "bg-orange/15 text-orange-text" : "bg-violet-soft text-violet",
      )}
    >
      {STEP_LABEL[status] ?? status}
    </span>
  );
}

export function OrderTimeline({ order }: { order: FullOrder }) {
  if (order.status === "CANCELLED" || order.status === "PENDING") {
    return (
      <ol className="flex flex-col gap-3">
        {[...order.events].reverse().map((e) => (
          <li key={e.id} className="flex gap-3 text-body-sm">
            <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink" />
            <span>
              <span className="font-semibold">{e.note ?? STEP_LABEL[e.status]}</span>
              <span className="block text-caption text-ink-muted">{formatDateTime(e.createdAt)}</span>
            </span>
          </li>
        ))}
      </ol>
    );
  }
  const current = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  return (
    <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2" aria-label="Delivery progress">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const ev = order.events.find((e) => e.status === s);
        return (
          <li key={s} className="flex items-center gap-3 sm:flex-col sm:items-start sm:gap-2">
            <span className="flex items-center gap-2 sm:w-full">
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", done ? "bg-ink text-white" : "border-[1.5px] border-line bg-white")}>
                {done && <Icon name="check" size={14} strokeWidth={2.5} />}
              </span>
              {i < STEPS.length - 1 && <span className={cn("hidden h-[2px] flex-1 rounded sm:block", i < current ? "bg-ink" : "bg-line")} />}
            </span>
            <span>
              <span className={cn("block text-body-sm font-semibold", !done && "text-ink-muted")}>{STEP_LABEL[s]}</span>
              {ev && <span className="block text-caption text-ink-muted">{formatDate(ev.createdAt)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function OrderDetails({ order }: { order: FullOrder }) {
  const addr = order.shippingAddress as { fullName: string; phone: string; line1: string; line2?: string | null; area?: string | null; city: string; district: string; postalCode?: string | null };
  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[24px] bg-card p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h4">Order status</h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <OrderTimeline order={order} />
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="rounded-[24px] bg-card p-5 sm:p-6">
          <h2 className="mb-4 text-h4">Items</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => {
              const opts = Object.values((i.options ?? {}) as Record<string, string>);
              return (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <Link href={`/products/${i.slug}`} className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-muted">
                    {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-cover" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/products/${i.slug}`} className="text-body-sm font-semibold hover:underline">
                      {i.name}
                    </Link>
                    <p className="text-caption text-ink-muted">
                      {opts.length ? `${opts.join(" / ")} · ` : ""}Qty {i.quantity}
                    </p>
                  </div>
                  <p className="text-body-sm font-semibold tabular-nums">{formatMoney(i.unitPrice * i.quantity, order.currency)}</p>
                </li>
              );
            })}
          </ul>
          <dl className="mt-3 flex flex-col gap-2 border-t border-line pt-4 text-body-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatMoney(order.subtotal, order.currency)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Delivery ({order.deliveryMethod})</dt>
              <dd className="tabular-nums">{order.shippingFee ? formatMoney(order.shippingFee, order.currency) : "Free"}</dd>
            </div>
            <div className="flex justify-between text-body font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatMoney(order.total, order.currency)}</dd>
            </div>
          </dl>
        </div>
        <div className="flex flex-col gap-6">
          <div className="rounded-[24px] bg-card p-5 sm:p-6">
            <h2 className="mb-3 text-h4">Delivery to</h2>
            <address className="text-body-sm not-italic">
              <strong>{addr.fullName}</strong>
              <br />
              {addr.line1}
              {addr.line2 ? `, ${addr.line2}` : ""}
              <br />
              {[addr.area, addr.city, addr.district, addr.postalCode].filter(Boolean).join(", ")}
              <br />
              {addr.phone}
            </address>
          </div>
          <div className="rounded-[24px] bg-card p-5 sm:p-6">
            <h2 className="mb-3 text-h4">Payment</h2>
            <p className="text-body-sm">{PAY_LABEL[order.paymentMethod]}</p>
            <p className="text-body-sm text-ink-muted">{PAY_STATUS[order.paymentStatus]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
