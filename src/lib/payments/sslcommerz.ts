import "server-only";
import { site } from "@/content/site";
import { toMajor } from "@/lib/utils/money";
import type { PaymentInit, PaymentProvider, PaymentValidation } from "./types";

/**
 * SSLCommerz (cards, bKash, Nagad). Configure with:
 * SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD, SSLCOMMERZ_SANDBOX=true|false
 * Flow: initiate session → shopper pays on SSLCommerz → SSLCommerz POSTs to our
 * success/fail/cancel URLs and IPN → we validate with the Validation API before
 * marking an order paid. Never trust the browser redirect alone.
 */
const base = () => (process.env.SSLCOMMERZ_SANDBOX === "false" ? "https://securepay.sslcommerz.com" : "https://sandbox.sslcommerz.com");
const creds = () => {
  const store_id = process.env.SSLCOMMERZ_STORE_ID;
  const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!store_id || !store_passwd) throw new Error("SSLCommerz credentials are not configured");
  return { store_id, store_passwd };
};

// Pre-selects the gateway tab for the method the shopper chose on our checkout.
const METHOD_CARDS: Record<PaymentInit["method"], string> = {
  BKASH: "bkash",
  NAGAD: "nagad",
  CARD: "visacard,mastercard,amexcard",
};

export const sslcommerzProvider: PaymentProvider = {
  name: "sslcommerz",

  async initiate(p) {
    const cb = `${site.url}/api/payments/sslcommerz`;
    const form = new URLSearchParams({
      ...creds(),
      total_amount: toMajor(p.amount, p.currency as "BDT").toFixed(2),
      currency: p.currency,
      tran_id: p.transactionId,
      success_url: `${cb}/success`,
      fail_url: `${cb}/fail`,
      cancel_url: `${cb}/cancel`,
      ipn_url: `${cb}/ipn`,
      multi_card_name: METHOD_CARDS[p.method],
      cus_name: p.customer.name,
      cus_email: p.customer.email,
      cus_phone: p.customer.phone,
      cus_add1: p.customer.address,
      cus_city: p.customer.city,
      cus_postcode: p.customer.postcode || "0000",
      cus_country: "Bangladesh",
      shipping_method: "Courier",
      ship_name: p.customer.name,
      ship_add1: p.customer.address,
      ship_city: p.customer.city,
      ship_postcode: p.customer.postcode || "0000",
      ship_country: "Bangladesh",
      num_of_item: String(p.itemCount),
      product_name: p.productNames.slice(0, 250),
      product_category: "General",
      product_profile: "physical-goods",
      value_a: p.orderNumber,
    });
    const res = await fetch(`${base()}/gwprocess/v4/api.php`, { method: "POST", body: form });
    const data = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };
    if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
      throw new Error(`SSLCommerz init failed: ${data.failedreason ?? res.status}`);
    }
    return { redirectUrl: data.GatewayPageURL };
  },

  async validate(payload): Promise<PaymentValidation> {
    const valId = payload.val_id;
    if (!valId) return { ok: false, transactionId: payload.tran_id, reason: "Missing val_id", raw: payload };
    const qs = new URLSearchParams({ val_id: valId, ...creds(), format: "json" });
    const res = await fetch(`${base()}/validator/api/validationserverAPI.php?${qs}`, { cache: "no-store" });
    const data = (await res.json()) as { status?: string; tran_id?: string; amount?: string; currency_type?: string; currency?: string; risk_level?: string };
    if (data.status !== "VALID" && data.status !== "VALIDATED") {
      return { ok: false, transactionId: data.tran_id ?? payload.tran_id, reason: `Validation status ${data.status}`, raw: data };
    }
    if (data.risk_level === "1") {
      return { ok: false, transactionId: data.tran_id, reason: "Marked high risk by SSLCommerz — hold for manual review", raw: data };
    }
    return {
      ok: true,
      transactionId: data.tran_id!,
      validationId: valId,
      amount: Math.round(Number(data.amount) * 100),
      currency: data.currency_type ?? data.currency ?? "BDT",
      raw: data,
    };
  },
};
