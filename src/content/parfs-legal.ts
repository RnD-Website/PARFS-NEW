/**
 * PARFS legal pages (/legal/[slug]), laid out after byredo.com/eu_en/terms-and-conditions.
 *
 * ⚠️ STARTING TEMPLATE — NOT LEGAL ADVICE. This copy is a reasonable US-oriented draft so the pages
 * have real structure; have it reviewed by a lawyer before launch. Business facts in [brackets] —
 * company name, address, state, return window, shipping promises — must be confirmed by PARFS.
 * Fill in `legalEntity` once and every page picks it up.
 */
export const legalEntity = {
  company: "[PARFS legal entity name]",
  address: "[Registered business address]",
  state: "[State of incorporation]",
  email: "hello@parfs.com",
  privacyEmail: "privacy@parfs.com",
  updated: "November 2026",
};

export type LegalArticle = { title: string; body: string[] };
export type LegalPage = { slug: string; nav: string; title: string; intro?: string; articles: LegalArticle[] };

const { company, address, state, email, privacyEmail } = legalEntity;

export const legalPages: LegalPage[] = [
  {
    slug: "terms",
    nav: "Terms of sale",
    title: "Terms & conditions of sale",
    intro:
      "These terms apply to every order placed on parfs.com. Please read them carefully before you buy — by placing an order you confirm that you accept them.",
    articles: [
      {
        title: "Company information",
        body: [
          `parfs.com is operated by ${company} (“PARFS”, “we”, “us”), a company organised under the laws of ${state}, with its registered office at ${address}.`,
          `For any question, request or help you may need, you can contact us at ${email}.`,
        ],
      },
      {
        title: "Scope of application",
        body: [
          "These Terms and Conditions of Sale govern all sales of products made by PARFS through parfs.com to consumers purchasing for their personal use. They apply to the exclusion of any other conditions, and the version in force on the date of your order is the one that applies.",
          "We may update these terms from time to time; any change applies only to orders placed after it is published.",
        ],
      },
      {
        title: "Products",
        body: [
          "Our fragrances are described and photographed as faithfully as possible. Colours of bottles and liquids may vary slightly depending on your screen, and minor differences do not affect your rights.",
          "Products are offered while stock lasts. If an item becomes unavailable after you order, we will let you know and refund any amount paid for it.",
        ],
      },
      {
        title: "Prices",
        body: [
          "Prices are shown in US dollars and exclude applicable sales tax, which is calculated at checkout based on your delivery address. Delivery charges, if any, are shown before you confirm your order.",
          "We reserve the right to change our prices at any time; you will be charged the price displayed when you place your order. If a price was displayed in obvious error, we may cancel the order and refund you in full.",
        ],
      },
      {
        title: "Ordering",
        body: [
          "To order, add products to your bag, proceed to checkout, provide the requested information and confirm payment. You will receive an email confirming receipt of your order; the contract is formed when we email you that your order has shipped.",
          "We may refuse or cancel an order where there is a payment problem, suspected fraud, an abnormal quantity or a previous dispute with the customer.",
        ],
      },
      {
        title: "Payment",
        body: [
          "Payment is taken at checkout by the methods offered there, which may include major credit and debit cards and Shop Pay. Payments are processed by our secure payment partners; PARFS never stores your full card details.",
          "Your order is processed once payment has been authorised.",
        ],
      },
      {
        title: "Delivery",
        body: [
          "We deliver to the addresses and countries listed at checkout. Delivery times, methods and costs are set out in our Shipping Policy and confirmed before you pay.",
          "Risk of loss passes to you when the parcel is delivered to the address you provided. Please check your parcel on arrival and tell us within 7 days of any damage or missing items.",
        ],
      },
      {
        title: "Returns and refunds",
        body: [
          "You may return eligible products under the conditions described in our Returns Policy. Refunds are made to the original payment method once the returned items have been received and inspected.",
        ],
      },
      {
        title: "Warranty and liability",
        body: [
          "Our products are covered by the warranties provided by applicable law. If a product arrives defective or not as described, contact us and we will replace or refund it.",
          "To the fullest extent permitted by law, PARFS is not liable for indirect or consequential losses, or for damage resulting from misuse of a product or failure to follow its instructions. Nothing in these terms limits liability that cannot be limited by law.",
        ],
      },
      {
        title: "Product safety",
        body: [
          "Fragrances are for external use only. Keep away from eyes, children and open flames, and discontinue use if irritation occurs. A full list of ingredients is printed on each box.",
        ],
      },
      {
        title: "Intellectual property",
        body: [
          "All content on parfs.com — including the PARFS name, logo, bottle designs, photographs, films and text — belongs to PARFS or its licensors and may not be reproduced without our written permission.",
        ],
      },
      {
        title: "Personal data",
        body: ["We process the personal information you give us to fulfil your order and as described in our Privacy Policy."],
      },
      {
        title: "Governing law and disputes",
        body: [
          `These terms are governed by the laws of ${state} and applicable US federal law. If a problem arises, please contact us first at ${email} — most issues can be settled quickly. Otherwise, disputes will be brought before the competent courts, without prejudice to any mandatory consumer-protection rights you have where you live.`,
        ],
      },
    ],
  },
  {
    slug: "privacy",
    nav: "Privacy policy",
    title: "Privacy policy",
    intro: "This policy explains what personal information PARFS collects, why we use it and the choices you have.",
    articles: [
      {
        title: "Who we are",
        body: [`${company}, ${address}, is responsible for the personal information collected through parfs.com. Questions about privacy can be sent to ${privacyEmail}.`],
      },
      {
        title: "Information we collect",
        body: [
          "Information you give us: your name, email address, phone number, delivery and billing addresses, order details, messages you send us and, if you subscribe, your marketing preferences.",
          "Information collected automatically: device and browser information, IP address, pages visited and similar usage data, collected through cookies and similar technologies (see our Cookie Policy).",
          "Payment details are entered directly with our payment partners; we do not store full card numbers.",
        ],
      },
      {
        title: "How we use it",
        body: [
          "To process and deliver your orders, provide customer service and handle returns.",
          "To send you news about the Maison, private launches and rituals — only if you have opted in. You can unsubscribe at any time from any email.",
          "To keep the site secure, prevent fraud, understand how it is used and improve it, and to comply with our legal obligations.",
        ],
      },
      {
        title: "Sharing",
        body: [
          "We share information only with service providers who help us run the business — hosting, payment processing, delivery, email and analytics — under contracts that require them to protect it, and with authorities where the law requires.",
          "We do not sell your personal information.",
        ],
      },
      {
        title: "Retention",
        body: ["We keep personal information only for as long as necessary for the purposes above, including to meet tax, accounting and legal requirements, and then delete or anonymise it."],
      },
      {
        title: "Your rights",
        body: [
          "Depending on where you live (including under the California Consumer Privacy Act and similar state laws), you may have the right to access, correct or delete your personal information, to obtain a copy of it, and to opt out of certain uses, such as targeted advertising.",
          `To exercise these rights, write to ${privacyEmail}. We will not discriminate against you for exercising them.`,
        ],
      },
      {
        title: "Security",
        body: ["We use technical and organisational measures to protect your information, including encryption in transit. No system is completely secure, but we work to keep your data safe."],
      },
      {
        title: "Children",
        body: ["parfs.com is not directed to children under 16, and we do not knowingly collect their personal information."],
      },
      {
        title: "Changes to this policy",
        body: ["We may update this policy from time to time. The date at the top shows when it was last revised; significant changes will be highlighted on the site or by email."],
      },
    ],
  },
  {
    slug: "cookies",
    nav: "Cookie policy",
    title: "Cookie policy",
    intro: "Cookies are small text files stored on your device when you visit a website. This policy explains how parfs.com uses them.",
    articles: [
      {
        title: "Strictly necessary cookies",
        body: ["These make the site work — remembering your bag, keeping checkout secure and saving your cookie choices. They cannot be switched off."],
      },
      {
        title: "Performance and analytics cookies",
        body: ["These help us understand how visitors use the site, which pages are popular and where something isn’t working, so we can improve it. The information is aggregated."],
      },
      {
        title: "Functional cookies",
        body: ["These remember preferences you choose, such as your region or language, to give you a more personal experience."],
      },
      {
        title: "Advertising cookies",
        body: ["With your consent, these are set by us or our partners to show you PARFS advertising that is relevant to you on other sites and to measure its effectiveness."],
      },
      {
        title: "Managing cookies",
        body: [
          "You can accept or refuse non-essential cookies at any time from the cookie settings on our site, and you can delete or block cookies in your browser settings. Blocking some cookies may affect how the site works.",
          `For any question about our use of cookies, contact ${privacyEmail}.`,
        ],
      },
    ],
  },
  {
    slug: "shipping",
    nav: "Shipping",
    title: "Shipping policy",
    intro: "Every PARFS order is packed by hand in our signature box and sent with tracking.",
    articles: [
      {
        title: "Where we ship",
        body: ["We currently ship to addresses within the United States. [Confirm whether international shipping is offered and to which countries.]"],
      },
      {
        title: "Delivery options and costs",
        body: [
          "Standard delivery is complimentary on every order and usually arrives within 3–5 business days. [Confirm.]",
          "Express delivery is available at checkout for a fee shown before you pay, and usually arrives within 1–2 business days. [Confirm.]",
        ],
      },
      {
        title: "Processing",
        body: ["Orders placed before 1 pm ET on a business day are usually dispatched the same day; others are dispatched the next business day. You will receive an email with tracking as soon as your parcel leaves us."],
      },
      {
        title: "Fragrance shipping restrictions",
        body: ["Fragrances contain alcohol and are classed as limited-quantity goods for transport. For this reason we cannot ship to P.O. boxes or APO/FPO addresses, and some express services may be unavailable for certain locations."],
      },
      {
        title: "Lost or damaged parcels",
        body: [`If your parcel arrives damaged, or tracking shows it delivered but you have not received it, contact ${email} within 7 days and we will make it right.`],
      },
    ],
  },
  {
    slug: "returns",
    nav: "Returns",
    title: "Returns & refunds",
    intro: "If something isn’t right, you can return it — here is how.",
    articles: [
      {
        title: "Return window",
        body: ["You may return unopened, unused products in their original packaging within 30 days of delivery for a full refund. [Confirm the return window.]"],
      },
      {
        title: "Opened products",
        body: ["For hygiene reasons, opened or used fragrances cannot be returned unless they are faulty. If you’re unsure which scent to choose, try our samples or speak with a specialist before you buy."],
      },
      {
        title: "How to return",
        body: [`Email ${email} with your order number and the items you wish to return. We will send you a prepaid return label and instructions — returns within the United States are free.`],
      },
      {
        title: "Refunds",
        body: ["Once your return arrives and has been inspected, we refund the original payment method within 5–10 business days. Original delivery charges are refunded if the whole order is returned."],
      },
      {
        title: "Faulty or incorrect items",
        body: [`If a product arrives damaged, faulty or isn’t what you ordered, contact ${email} within 7 days of delivery with a photo and we will replace or refund it at no cost.`],
      },
      {
        title: "Gifts and engraved bottles",
        body: ["Gifts can be returned for a gift card by the recipient. Engraved or personalised bottles are made to order and cannot be returned unless faulty."],
      },
    ],
  },
];
