import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { formatMoney } from "@/lib/utils/money";
import { formatDate, pluralize } from "@/lib/utils/format";
import { OrderStatusBadge } from "@/components/orders/order-details";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "My orders", robots: { index: false } };

export default async function OrdersPage() {
  const user = await requireUser("/account/orders");
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="mb-5 text-h3">
        Order history
      </h2>
      {orders.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-[24px] bg-card p-6">
          <p className="text-body text-ink-muted">No orders yet.</p>
          <ButtonLink href="/shop" size="sm" arrow>
            Start shopping
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-col gap-4 rounded-[24px] bg-card p-5 transition-colors hover:bg-muted sm:flex-row sm:items-center">
                <div className="flex -space-x-3">
                  {o.items.slice(0, 3).map((i) => (
                    <span key={i.id} className="relative size-14 overflow-hidden rounded-xl border-2 border-card bg-muted">
                      {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
                    </span>
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-label">{o.orderNumber}</p>
                  <p className="text-caption text-ink-muted">
                    Placed {formatDate(o.createdAt)} · {pluralize(o.items.reduce((n, i) => n + i.quantity, 0), "item")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-semibold tabular-nums">{formatMoney(o.total, o.currency)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
