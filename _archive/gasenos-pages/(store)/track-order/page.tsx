import type { Metadata } from "next";
import { getOrderForViewer } from "@/lib/orders/queries";
import { OrderDetails } from "@/components/orders/order-details";
import { TrackOrderForm } from "@/components/orders/track-order-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatDateTime } from "@/lib/utils/format";

export const metadata: Metadata = { title: "Track your order", description: "Check the status of your GASENOS order." };

export default async function TrackOrderPage({ searchParams }: PageProps<"/track-order">) {
  const sp = await searchParams;
  const orderNumber = typeof sp.order === "string" ? sp.order.toUpperCase() : null;
  const order = orderNumber ? await getOrderForViewer(orderNumber, typeof sp.t === "string" ? sp.t : null) : null;

  return (
    <div className="container-page pt-8 pb-16 lg:pt-12 lg:pb-24">
      <div className="mx-auto max-w-5xl">
        <Eyebrow>ORDER TRACKING</Eyebrow>
        {order ? (
          <>
            <h1 className="mt-3 text-h1">Order {order.orderNumber}</h1>
            <p className="mt-1 text-body-sm text-ink-muted">Placed {formatDateTime(order.createdAt)}</p>
            <div className="mt-8">
              <OrderDetails order={order} />
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-3 text-h1">Track your order</h1>
            <p className="mt-3 max-w-xl text-body text-ink-2">Enter your order number (from your confirmation email) and the email you used at checkout.</p>
            <div className="mt-8 max-w-xl">
              <TrackOrderForm defaultOrder={orderNumber ?? ""} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
