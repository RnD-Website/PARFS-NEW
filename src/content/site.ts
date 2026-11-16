/**
 * Central site configuration.
 *
 * ⚠️ Values marked PLACEHOLDER are NOT real business information. They are shown
 * exactly as in the Figma design until GASENOS provides the real details.
 * Update them here — every page reads from this file.
 */

export const site = {
  name: "PARFS",
  aiName: "PARFS",
  tagline: "Maison de Parfum — scent for every soul.",
  description:
    "PARFS — Maison de Parfum. Eaux de parfum and extraits in weighted glass and solid brass.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_BD",
  currency: "BDT",
  country: "BD",

  contact: {
    address: "[Street address, City]", // PLACEHOLDER
    email: "[support@gasenos.com]", // PLACEHOLDER
    phone: "[+880 phone number]", // PLACEHOLDER
    hours: null as string | null, // PLACEHOLDER — add support hours when known
  },

  /** Social profile URLs. `null` = not provided yet; the link renders as plain text. */
  social: [
    { label: "Instagram", href: null as string | null },
    { label: "Facebook", href: null as string | null },
    { label: "TikTok", href: null as string | null },
    { label: "YouTube", href: null as string | null },
  ],

  legalName: "GASENOS", // PLACEHOLDER — registered company name
} as const;

export const mainNav = [
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "/categories" },
  { label: "Deals", href: "/deals" },
  { label: "New in", href: "/new" },
  { label: "Help", href: "/help" },
] as const;

export const footerNav = {
  shop: [
    { label: "Electronics", href: "/shop/electronics" },
    { label: "Fashion", href: "/shop/fashion" },
    { label: "Home & living", href: "/shop/home-living" },
    { label: "Beauty", href: "/shop/beauty" },
  ],
  help: [
    { label: "Shipping & delivery", href: "/policies/shipping" },
    { label: "Returns", href: "/policies/returns" },
    { label: "Order tracking", href: "/track-order" },
    { label: "Ask GASENOS AI", href: "/assistant" },
  ],
  legal: [
    { label: "Privacy", href: "/policies/privacy" },
    { label: "Terms", href: "/policies/terms" },
  ],
} as const;

/**
 * Store rules used by cart, checkout and the AI assistant.
 *
 * ⚠️ PLACEHOLDER amounts: the design states "Free delivery on orders over $50",
 * "30-day free returns", "1-year warranty" and "2–4 working days". The USD
 * threshold was converted at ৳120/$ — confirm the real BDT values and fees.
 */
export const storePolicy = {
  freeShippingThreshold: 6_000_00, // ৳6,000 (from $50) — PLACEHOLDER
  returnDays: 30,
  warrantyYears: 1,
  deliveryEstimate: "2–4 working days",
  deliveryMethods: [
    {
      id: "standard",
      label: "Standard delivery",
      description: "2–4 working days",
      fee: 120_00, // PLACEHOLDER
    },
    {
      id: "express",
      label: "Express home delivery",
      description: "Faster dispatch where available",
      fee: 250_00, // PLACEHOLDER
    },
  ],
  paymentMethods: [
    { id: "COD", label: "Cash on delivery", description: "Pay in cash when your order arrives." },
    { id: "BKASH", label: "bKash", description: "Pay securely with bKash via SSLCommerz." },
    { id: "NAGAD", label: "Nagad", description: "Pay securely with Nagad via SSLCommerz." },
    { id: "CARD", label: "Credit / debit card", description: "Visa, Mastercard, Amex via SSLCommerz." },
  ],
} as const;

export type DeliveryMethodId = (typeof storePolicy.deliveryMethods)[number]["id"];
export type PaymentMethodId = (typeof storePolicy.paymentMethods)[number]["id"];
