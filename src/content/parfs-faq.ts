/**
 * PARFS FAQs (/faq), laid out after jomalone.com/customer-service/faq: topics with numbered questions
 * that open one at a time.
 *
 * Answers follow the PARFS legal pages (shipping, returns) and contact page. Anything that is a business
 * promise — delivery times, return window, engraving, samples — is a PLACEHOLDER to confirm before launch.
 */
export type FaqTopic = { id: string; title: string; items: { q: string; a: string[] }[] };

export const faqPage = {
  title: "Frequently asked questions",
  intro: "Everything you need to know about ordering, delivery, returns and caring for your fragrance. Can’t find your answer? Our Client Advisors are here to help.",
};

export const faqTopics: FaqTopic[] = [
  {
    id: "orders",
    title: "Orders & payment",
    items: [
      {
        q: "How do I place an order?",
        a: ["Choose your fragrance, select “Add to bag”, then open your bag and select “Checkout”. You can also use Shop Pay for a faster checkout. You’ll receive an email confirming your order as soon as it is placed."],
      },
      {
        q: "Which payment methods do you accept?",
        a: ["We accept major credit and debit cards and Shop Pay. All payments are processed securely by our payment partners — PARFS never stores your full card details."],
      },
      {
        q: "Can I change or cancel my order?",
        a: ["We prepare orders quickly, so please contact us as soon as possible. If your order has not yet been dispatched, we will do our best to change or cancel it. Once dispatched, you can return it under our returns policy."],
      },
      {
        q: "Do I need an account to order?",
        a: ["No — you can check out as a guest. An account lets you see your order history and check out faster next time."],
      },
      {
        q: "Will I be charged sales tax?",
        a: ["Sales tax is calculated at checkout based on your delivery address and shown before you pay."],
      },
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      {
        q: "How much does delivery cost?",
        a: ["Standard delivery is complimentary on every order. Express delivery is available at checkout for a fee shown before you pay."],
      },
      {
        q: "How long will my order take to arrive?",
        a: ["Standard delivery usually takes 3–5 business days and express 1–2 business days. Orders placed before 1 pm ET on a business day are usually dispatched the same day."],
      },
      {
        q: "How can I track my order?",
        a: ["You’ll receive an email with a tracking link as soon as your parcel leaves us. You can also track it from the “Your order” section of our Contact page using your order number and email."],
      },
      {
        q: "Do you ship internationally?",
        a: ["We currently deliver within the United States. Because fragrances contain alcohol, we can’t ship to P.O. boxes or APO/FPO addresses."],
      },
    ],
  },
  {
    id: "returns",
    title: "Returns & refunds",
    items: [
      {
        q: "What is your returns policy?",
        a: ["You can return unopened, unused products in their original packaging within 30 days of delivery for a full refund. Returns within the United States are free."],
      },
      {
        q: "Can I return an opened fragrance?",
        a: ["For hygiene reasons, opened or used fragrances can’t be returned unless they are faulty. If you’re unsure which scent to choose, book a consultation with one of our specialists before you buy."],
      },
      {
        q: "How do I start a return?",
        a: ["Email hello@parfs.com with your order number and the items you’d like to return. We’ll send you a prepaid return label and instructions."],
      },
      {
        q: "When will I receive my refund?",
        a: ["Once your return arrives and has been inspected, we refund your original payment method within 5–10 business days."],
      },
      {
        q: "My order arrived damaged — what should I do?",
        a: ["We’re sorry. Contact us within 7 days of delivery with your order number and a photo, and we’ll replace or refund it at no cost."],
      },
    ],
  },
  {
    id: "fragrance",
    title: "Our fragrances",
    items: [
      {
        q: "What is the difference between eau de parfum and extrait de parfum?",
        a: ["Concentration. Our eaux de parfum are rich and luminous, designed to be worn every day. Our extraits contain a higher concentration of perfume oils for a deeper, longer-lasting trail that sits closer to the skin."],
      },
      {
        q: "How long does a PARFS fragrance last?",
        a: ["Every PARFS fragrance is made with an 18% perfume concentrate, so most wear for 8 hours or more. Longevity varies with skin type, climate and how much you apply."],
      },
      {
        q: "How should I apply my fragrance?",
        a: ["Spray onto pulse points — the wrists, the base of the throat and behind the ears — from about 15 cm away. Let it dry naturally rather than rubbing it in, which can break down the top notes."],
      },
      {
        q: "How should I store my fragrance?",
        a: ["Keep the bottle upright, closed and away from direct sunlight, heat and humidity. Stored well, an unopened fragrance keeps its character for several years."],
      },
      {
        q: "Are your fragrances tested on animals?",
        a: ["No. PARFS does not test its products on animals, and we do not ask others to test on our behalf. [Confirm before launch.]"],
      },
    ],
  },
  {
    id: "gifting",
    title: "Gifting & engraving",
    items: [
      {
        q: "Can I add a gift message?",
        a: ["Yes — write your message in the “Special instructions” box in your bag, or in the order notes at checkout. Every order arrives in our signature box."],
      },
      {
        q: "Can I engrave my bottle?",
        a: ["Our bottles are refillable and engravable. To request engraving, add the initials or short message you’d like in “Special instructions” and our team will confirm the details with you by email. Engraved bottles are made to order and can’t be returned unless faulty."],
      },
      {
        q: "Can I send a gift directly to someone else?",
        a: ["Of course. Enter the recipient’s name and address as the delivery address at checkout. Prices are never included in the parcel."],
      },
    ],
  },
  {
    id: "services",
    title: "Services & account",
    items: [
      {
        q: "What is a private consultation?",
        a: ["A one-to-one session with a PARFS fragrance specialist, in person or by video, to explore the collection and find the scent that suits you. Request one from our Contact page."],
      },
      {
        q: "How do I subscribe to the Maison newsletter?",
        a: ["Enter your email in the “Subscribe to the Maison” box at the bottom of any page. You can unsubscribe at any time from any email."],
      },
      {
        q: "How do you use my personal information?",
        a: ["Only to process your orders, answer your questions and — if you’ve opted in — send you news from the Maison. Read our Privacy Policy for the details."],
      },
    ],
  },
];
