import "server-only";
import { createHmac } from "node:crypto";
import type { PaymentProvider } from "./types";

/**
 * TEST MODE gateway used until SSLCommerz credentials are added. It sends the shopper
 * to /checkout/test-payment where they can simulate success / failure / cancel.
 * Callbacks are HMAC-signed so they can't be forged by editing the URL.
 */
const sign = (tran: string, amount: number) =>
  createHmac("sha256", process.env.AUTH_SECRET ?? "dev-only-secret").update(`mockpay:${tran}:${amount}`).digest("base64url").slice(0, 24);

export const mockPaymentProvider: PaymentProvider = {
  name: "mock",
  async initiate(p) {
    const qs = new URLSearchParams({ tran: p.transactionId, amount: String(p.amount), method: p.method, order: p.orderNumber, sig: sign(p.transactionId, p.amount) });
    return { redirectUrl: `/checkout/test-payment?${qs}` };
  },
  async validate(payload) {
    const amount = Number(payload.amount);
    if (!payload.tran_id || payload.sig !== sign(payload.tran_id, amount)) {
      return { ok: false, transactionId: payload.tran_id, reason: "Invalid test signature" };
    }
    return { ok: true, transactionId: payload.tran_id, validationId: `TEST-${payload.tran_id}`, amount, currency: "BDT", raw: { test: true } };
  },
};

export const mockSignature = sign;
