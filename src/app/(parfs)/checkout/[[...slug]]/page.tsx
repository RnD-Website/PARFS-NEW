import type { Metadata } from "next";
import { BlankPage } from "@/components/parfs/blank/blank-page";
import { CheckoutView } from "@/components/parfs/checkout/checkout-view";

export const metadata: Metadata = { title: { absolute: "Checkout — PARFS" }, robots: { index: false, follow: false } };

/** /checkout — PARFS checkout (after Étoile's). Sub-pages (success, payment-failed, …) stay blank until payments go live. */
export default async function CheckoutPage({ params }: PageProps<"/checkout/[[...slug]]">) {
  const { slug } = await params;
  if (slug?.length) return <BlankPage title="Checkout" />;
  return <CheckoutView />;
}
