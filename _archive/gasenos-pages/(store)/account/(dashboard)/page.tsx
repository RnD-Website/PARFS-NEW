import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { formatMoney } from "@/lib/utils/money";
import { formatDate } from "@/lib/utils/format";
import { OrderStatusBadge } from "@/components/orders/order-details";
import { ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons/icon";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

export default async function AccountHome() {
  const user = await requireUser("/account");
  const [orders, orderCount, addressCount, wishCount] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { items: { take: 1 } } }),
    db.order.count({ where: { userId: user.id } }),
    db.address.count({ where: { userId: user.id } }),
    db.wishlistItem.count({ where: { userId: user.id } }),
  ]);
  const tiles: { label: string; value: number; href: string; icon: IconName }[] = [
    { label: "Orders", value: orderCount, href: "/account/orders", icon: "package" },
    { label: "Saved addresses", value: addressCount, href: "/account/addresses", icon: "location" },
    { label: "Wishlist", value: wishCount, href: "/wishlist", icon: "heart" },
  ];
  return (
    <div className="flex flex-col gap-8">
      <ul className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link href={t.href} className="flex items-center gap-4 rounded-[20px] bg-card p-5 transition-colors hover:bg-muted">
              <span className="flex size-12 items-center justify-center rounded-full bg-image">
                <Icon name={t.icon} size={22} />
              </span>
              <span>
                <span className="block text-h3 tabular-nums">{t.value}</span>
                <span className="text-body-sm text-ink-muted">{t.label}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <section aria-labelledby="recent-orders" className="rounded-[24px] bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-orders" className="text-h4">
            Recent orders
          </h2>
          {orderCount > 3 && (
            <Link href="/account/orders" className="text-body-sm font-semibold underline-offset-4 hover:underline">
              View all
            </Link>
          )}
        </div>
        {orders.length ? (
          <ul className="divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/account/orders/${o.orderNumber}`} className="flex flex-wrap items-center justify-between gap-3 py-4 hover:opacity-80">
                  <span>
                    <span className="block text-label">{o.orderNumber}</span>
                    <span className="text-caption text-ink-muted">
                      {formatDate(o.createdAt)} · {o.items[0]?.name}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <OrderStatusBadge status={o.status} />
                    <span className="font-semibold tabular-nums">{formatMoney(o.total, o.currency)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="text-body text-ink-muted">You haven’t placed any orders yet.</p>
            <ButtonLink href="/shop" size="sm" arrow>
              Start shopping
            </ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}
