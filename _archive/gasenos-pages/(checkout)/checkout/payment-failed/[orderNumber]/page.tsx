import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderForViewer } from "@/lib/orders/queries";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";

export const metadata: Metadata = { title: "Payment not completed", robots: { index: false } };

export default async function PaymentFailedPage({ params, searchParams }: PageProps<"/checkout/payment-failed/[orderNumber]">) {
  const { orderNumber } = await params;
  const sp = await searchParams;
  const order = await getOrderForViewer(orderNumber, typeof sp.t === "string" ? sp.t : null);
  if (!order) notFound();
  const cancelled = sp.reason === "cancel";
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
        <Icon name="alert" size={32} />
      </span>
      <h1 className="text-h2">{cancelled ? "Payment cancelled" : "Payment didn’t go through"}</h1>
      <p className="max-w-lg text-body text-ink-2">
        {cancelled ? "You cancelled the payment" : "Your payment could not be completed"}, so order <strong>{order.orderNumber}</strong> was not placed and you
        haven’t been charged. Your cart is still saved — you can try again or choose cash on delivery.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/checkout" arrow>
          Try again
        </ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact support
        </ButtonLink>
      </div>
    </div>
  );
}
