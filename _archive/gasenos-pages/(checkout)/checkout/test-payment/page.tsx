import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { paymentTestMode } from "@/lib/payments";
import { mockSignature } from "@/lib/payments/mock";
import { formatMoney } from "@/lib/utils/money";
import { TestPaymentActions } from "@/components/checkout/test-payment-actions";

export const metadata: Metadata = { title: "Test payment", robots: { index: false } };

const LABEL: Record<string, string> = { BKASH: "bKash", NAGAD: "Nagad", CARD: "Card" };

/** Simulated SSLCommerz page — only available while PAYMENT_PROVIDER is not sslcommerz. */
export default async function TestPaymentPage({ searchParams }: PageProps<"/checkout/test-payment">) {
  if (!paymentTestMode()) notFound();
  const sp = await searchParams;
  const tran = String(sp.tran ?? "");
  const amount = String(sp.amount ?? "");
  const sig = String(sp.sig ?? "");
  if (!tran || !/^\d+$/.test(amount) || mockSignature(tran, Number(amount)) !== sig) notFound();
  return (
    <div className="container-page flex min-h-[60vh] items-center justify-center py-16">
      <div className="w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-xl">
        <p className="mx-auto mb-4 w-fit rounded-full bg-violet-soft px-3 py-1 text-caption font-bold tracking-wide text-violet uppercase">Test mode</p>
        <h1 className="text-h3">Simulated {LABEL[String(sp.method)] ?? "online"} payment</h1>
        <p className="mt-2 text-body-sm text-ink-muted">
          This stands in for the SSLCommerz payment page until merchant credentials are configured. No money moves.
        </p>
        <p className="mt-6 text-body-sm text-ink-muted">Order {String(sp.order ?? "")}</p>
        <p className="font-display text-[40px] font-extrabold tracking-[-0.025em]">{formatMoney(Number(amount))}</p>
        <TestPaymentActions tran={tran} amount={amount} sig={sig} />
      </div>
    </div>
  );
}
