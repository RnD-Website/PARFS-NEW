import "server-only";
import type { PaymentProvider } from "./types";
import { sslcommerzProvider } from "./sslcommerz";
import { mockPaymentProvider } from "./mock";

/** PAYMENT_PROVIDER=sslcommerz (needs credentials) | mock (test mode, default). */
export function getPaymentProvider(): PaymentProvider {
  if (process.env.PAYMENT_PROVIDER === "sslcommerz") return sslcommerzProvider;
  return mockPaymentProvider;
}

export const paymentTestMode = () => process.env.PAYMENT_PROVIDER !== "sslcommerz";
