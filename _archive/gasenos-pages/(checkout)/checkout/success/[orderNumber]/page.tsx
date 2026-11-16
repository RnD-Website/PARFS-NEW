import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderForViewer } from "@/lib/orders/queries";
import { OrderDetails } from "@/components/orders/order-details";
import { ClearCart } from "@/components/checkout/clear-cart";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { getCurrentUser } from "@/lib/auth/session";
import { orderToken } from "@/lib/orders/access";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default async function SuccessPage({ params, searchParams }: PageProps<"/checkout/success/[orderNumber]">) {
  const { orderNumber } = await params;
  const t = (await searchParams).t;
  const order = await getOrderForViewer(orderNumber, typeof t === "string" ? t : null);
  if (!order) notFound();
  const user = await getCurrentUser();
  const paidOnline = order.paymentStatus === "PAID";

  return (
    <div className="container-page py-10 lg:py-16">
      <ClearCart />
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-success text-white">
          <Icon name="check" size={32} strokeWidth={2.2} />
        </span>
        <h1 className="text-h1">Thank you, {order.customerName.split(" ")[0]}!</h1>
        <p className="text-body-lg text-ink-2">
          Order <strong>{order.orderNumber}</strong> is confirmed{paidOnline ? " and paid" : " — pay cash on delivery"}. We’ve emailed a confirmation to{" "}
          <strong>{order.email}</strong>.
        </p>
      </div>
      <div className="mx-auto mt-10 max-w-5xl">
        <OrderDetails order={order} />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/shop" arrow>
          Continue shopping
        </ButtonLink>
        <ButtonLink href={user ? `/account/orders/${order.orderNumber}` : `/track-order?order=${order.orderNumber}&t=${orderToken(order.orderNumber)}`} variant="outline">
          Track this order
        </ButtonLink>
        {!user && (
          <ButtonLink href={`/account/register?email=${encodeURIComponent(order.email)}`} variant="ghost">
            Create an account to save your orders
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
