import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { paymentTestMode } from "@/lib/payments";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutForm testMode={paymentTestMode()} />;
}
