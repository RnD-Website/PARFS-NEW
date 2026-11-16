import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { getOrderForViewer } from "@/lib/orders/queries";
import { OrderDetails } from "@/components/orders/order-details";
import { formatDateTime } from "@/lib/utils/format";
import { Icon } from "@/components/icons/icon";

export const metadata: Metadata = { title: "Order details", robots: { index: false } };

export default async function OrderPage({ params }: PageProps<"/account/orders/[orderNumber]">) {
  const { orderNumber } = await params;
  await requireUser(`/account/orders/${orderNumber}`);
  const order = await getOrderForViewer(orderNumber);
  if (!order) notFound();
  return (
    <div className="flex flex-col gap-5">
      <Link href="/account/orders" className="inline-flex items-center gap-1.5 text-body-sm font-semibold hover:underline">
        <Icon name="arrow-left" size={16} /> All orders
      </Link>
      <div>
        <h2 className="text-h3">Order {order.orderNumber}</h2>
        <p className="text-body-sm text-ink-muted">Placed {formatDateTime(order.createdAt)}</p>
      </div>
      <OrderDetails order={order} />
      <p className="text-body-sm text-ink-muted">
        Need help with this order?{" "}
        <Link href={`/contact?order=${order.orderNumber}`} className="font-semibold text-ink underline underline-offset-4">
          Contact support
        </Link>{" "}
        — to return an item, mention the order number and the item.
      </p>
    </div>
  );
}
