import { storePolicy } from "./site";
import { formatMoney } from "@/lib/utils/money";

/**
 * Policy pages. Only facts stated in the design or confirmed by GASENOS are written;
 * everything else is flagged as pending legal/business copy.
 */
export type Policy = { slug: string; title: string; intro: string; sections: { heading: string; body: string[] }[]; pending?: string };

const free = formatMoney(storePolicy.freeShippingThreshold);

export const policies: Policy[] = [
  {
    slug: "shipping",
    title: "Shipping & delivery",
    intro: "How and when your GASENOS order reaches you.",
    sections: [
      { heading: "Delivery times", body: [`Most orders arrive in ${storePolicy.deliveryEstimate}.`, "You’ll get a tracking link by email and SMS as soon as your parcel ships."] },
      {
        heading: "Delivery options & fees",
        body: [
          `Delivery is free on orders over ${free}.`,
          ...storePolicy.deliveryMethods.map((m) => `${m.label}: ${m.description} — ${formatMoney(m.fee)}${m.id === "standard" ? ` (free over ${free})` : ""}.`),
        ],
      },
      { heading: "Tracking", body: ["Track any order from My account → Orders, or on the Track order page with your order number and email."] },
    ],
    pending: "Confirm delivery fees, coverage areas (inside/outside Dhaka), courier partners and express availability.",
  },
  {
    slug: "returns",
    title: "Returns & refunds",
    intro: `You have ${storePolicy.returnDays} days to return an item for a free refund.`,
    sections: [
      { heading: "How to return", body: ["Contact us with your order number and the item you’d like to return, or start from the order in My account.", "We’ll arrange collection or tell you where to drop it off."] },
      { heading: "Refunds", body: ["Refunds go back to your original payment method. Cash-on-delivery orders are refunded by bKash, Nagad or bank transfer."] },
    ],
    pending: "Confirm return conditions (unused/original packaging, excluded items such as beauty products), refund timelines and the COD refund method.",
  },
  {
    slug: "warranty",
    title: "Warranty",
    intro: `Products come with a ${storePolicy.warrantyYears}-year warranty.`,
    sections: [{ heading: "Making a claim", body: ["Contact us with your order number, a description of the issue and photos if possible."] }],
    pending: "Confirm warranty coverage per category and exclusions.",
  },
  {
    slug: "privacy",
    title: "Privacy policy",
    intro: "How GASENOS collects, uses and protects your personal information.",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account details (name, email, mobile number), delivery addresses, and order history.",
          "Messages you send to GASENOS AI are processed to answer you; GASENOS AI only uses our product catalogue and policies.",
          "Payments are processed by SSLCommerz; we never see or store your full card or wallet details.",
        ],
      },
    ],
    pending: "Full privacy policy text must be supplied/reviewed by GASENOS’ legal adviser before launch.",
  },
  {
    slug: "terms",
    title: "Terms & conditions",
    intro: "The terms that apply when you shop at GASENOS.",
    sections: [],
    pending: "Terms & conditions text must be supplied/reviewed by GASENOS’ legal adviser before launch.",
  },
];

export const helpTopics = [
  { slug: "gift-vouchers", title: "GASENOS gift vouchers", pending: "Describe how gift vouchers are bought, delivered and redeemed." },
  { slug: "gift-cards", title: "Send a gift card", pending: "Describe gift card denominations, delivery (email/SMS) and validity." },
  { slug: "click-and-collect", title: "Order online, collect in store", pending: "List pickup locations, opening hours and collection steps." },
  { slug: "instalments", title: "Pay in easy instalments", pending: "Name the EMI/instalment provider, eligible cards/banks and minimum order value." },
];
