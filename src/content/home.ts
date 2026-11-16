/**
 * Homepage & marketing copy — taken verbatim from the Figma design, with "BRAND" →
 * "GASENOS" and USD amounts converted to BDT (৳120 = $1, PLACEHOLDER rate).
 */

export const hero = {
  headline: ["Everything you love,", "one cart away."],
  subtext:
    "Tech, fashion, home and beauty — hand-picked, fairly priced, delivered fast. Not sure what to pick? Our AI assistant finds it for you.",
  primaryCta: { label: "Shop now", href: "/shop" },
  secondaryCta: { label: "Explore collections", href: "/categories" },
  aiHint: { title: "Not sure what to buy?", prompts: ["Gift for dad under ৳12,000", "Best earbuds for the gym"] },
  floatingProductSlug: "studio-max-headphones",
  floatingProductLabel: "New drop · Audio",
};

export const searchPrompts = [
  "Gift for dad under ৳12,000",
  "Best earbuds for the gym",
  "Running shoes under ৳18,000",
  "Cosy reading corner setup",
];

export const tickerCategories = [
  { label: "Electronics", href: "/shop/electronics" },
  { label: "Fashion", href: "/shop/fashion" },
  { label: "Home", href: "/shop/home-living" },
  { label: "Beauty", href: "/shop/beauty" },
  { label: "Audio", href: "/shop/audio" },
  { label: "Footwear", href: "/shop/footwear" },
];

export const about = {
  eyebrow: "About us",
  lead: "GASENOS is a modern marketplace for the things you use every day — ",
  rest: "from the gadgets in your bag to the chair you unwind in, chosen for quality and priced to stay fair.",
  cta: { label: "Read more about us", href: "/about" },
  image: { src: "/images/marketing/about-lifestyle.png", alt: "Woman in an orange outfit walking with GASENOS shopping bags" },
};

export const shopByCategory = {
  eyebrow: "Shop by category",
  title: "Find your next favourite",
  link: { label: "All categories", href: "/categories" },
};

export const aiSection = {
  eyebrow: "New · GASENOS AI",
  title: ["Shop smarter with your", "personal AI assistant."],
  subtext:
    "Describe what you need in plain words. GASENOS AI finds matching products, explains why they fit, checks your size and adds everything to your cart in one tap.",
  placeholder: "Ask AI: “running shoes under ৳18,000 for daily walks”",
  prompts: ["Gift for dad under ৳12,000", "Complete my workout look", "Compare these 2 earbuds", "Cosy reading corner setup"],
  cta: "Try GASENOS AI",
  demo: {
    user: "I need comfy running shoes under ৳18,000 for daily 5K runs. I'm usually EU 42.",
    ai: "Here are 3 picks in EU 42 within budget. The Aero Runner X is the lightest — and 20% off today.",
    picks: [
      { slug: "aero-runner-x", title: "Aero Runner X · EU 42", note: "Lightest pick · 20% off · in stock", image: "/images/products/ai-aero-runner-x.png", size: "42", color: "volt-orange" },
      { slug: "cloud-stride-2", title: "Cloud Stride 2 · EU 42", note: "Extra cushioning for longer runs", image: "/images/products/ai-cloud-stride-2.png", size: "42" },
      { slug: "pace-lite", title: "Pace Lite · EU 42", note: "Best value · breathable mesh", image: "/images/products/ai-pace-lite.png", size: "42" },
    ],
    followUp: "Ask a follow-up: “show me in black”",
  },
  features: [
    { icon: "search", title: "Ask in your own words", text: "Search by need, budget or occasion — not just keywords." },
    { icon: "ruler", title: "Size & fit advisor", text: "Tell it your usual size; it picks the right fit so you return less." },
    { icon: "compare", title: "Compare in one tap", text: "Side-by-side specs, prices and reviews, summarised for you." },
    { icon: "bell", title: "Price-drop alerts", text: "Save an item and GASENOS AI pings you when it goes on sale." },
    { icon: "gift", title: "Smart gift finder", text: "Answer 3 quick questions and get a ready-to-buy shortlist." },
  ] as const,
};

export const bestSellers = {
  eyebrow: "Top selling",
  title: "Best sellers this week",
  tabs: [
    { label: "All", value: "" },
    { label: "Electronics", value: "electronics" },
    { label: "Fashion", value: "fashion" },
    { label: "Home", value: "home-living" },
    { label: "Beauty", value: "beauty" },
  ],
  seeAll: { label: "See all products", href: "/shop" },
};

export const salePromo = {
  title: "Save up to 40% on selected tech, fashion & home picks.",
  cta: { label: "Shop the sale", href: "/deals" },
  images: {
    campaign: { src: "/images/marketing/sale-campaign.png", alt: "Model in a dark jacket and white sneakers seated on a block under warm light" },
    earbuds: { src: "/images/marketing/sale-earbuds.png", alt: "Wireless earbuds with charging case" },
    chair: { src: "/images/marketing/sale-egg-chair.png", alt: "White egg chair on an orange background" },
  },
  links: [
    { label: "Electronics", href: "/deals?category=electronics" },
    { label: "Fashion", href: "/deals?category=fashion" },
    { label: "Home & living", href: "/deals?category=home-living" },
    { label: "Beauty & care", href: "/deals?category=beauty" },
  ],
};

export const featured = {
  eyebrow: "Featured drop",
  slug: "aero-runner-x",
  title: "Aero Runner X — Lightweight Everyday Sneaker",
  fitCheck: {
    title: "AI fit check: EU 42 recommended",
    text: "Based on your past orders this model runs true to size. Want me to compare it with the Cloud Stride 2?",
    cta: "Ask GASENOS AI about this product",
    prompt: "Compare the Aero Runner X with the Cloud Stride 2 for daily runs in EU 42",
  },
};

export const reviews = {
  eyebrow: "Real customers · Real orders",
  title: "The receipts don’t lie.",
  items: [
    { type: "photo", image: "/images/reviews/customer-headphones.png", alt: "Customer unboxing Studio Max Headphones" },
    {
      type: "review",
      name: "ALYSSA H.",
      rating: 5,
      product: "STUDIO MAX HEADPHONES",
      slug: "studio-max-headphones",
      quote: "Asked the AI for quiet headphones for a noisy commute. First pick — total silence on the bus.",
      thumb: "/images/reviews/thumb-alyssa-h-headphones.png",
    },
    { type: "photo", image: "/images/reviews/customer-sneaker.png", alt: "Customer lacing up Aero Runner X sneakers on stairs" },
    {
      type: "review",
      name: "RAFI K.",
      rating: 5,
      product: "AERO RUNNER X (EU 42)",
      slug: "aero-runner-x",
      quote: "So light I forget I’m wearing them. The AI fit check said EU 42 — spot on.",
      thumb: "/images/reviews/thumb-rafi-k-sneaker.png",
    },
    {
      type: "review",
      name: "PRIYA S.",
      rating: 5,
      product: "GLOW RITUAL SERUM SET",
      slug: "glow-ritual-serum-set",
      quote: "Bought this for my sister who’s picky about skincare. She’s now completely obsessed.",
      thumb: "/images/reviews/thumb-priya-s-serum.png",
    },
    { type: "photo", image: "/images/reviews/customer-serum.png", alt: "Customer holding the Glow Ritual Serum Set" },
    {
      type: "review",
      name: "MAYA T.",
      rating: 5,
      product: "COCOA LOUNGE CHAIR",
      slug: "cocoa-lounge-chair",
      quote: "Looks even better than the photos. Delivered in two days — the cat agrees.",
      thumb: "/images/reviews/thumb-maya-t-chair.png",
    },
    { type: "photo", image: "/images/reviews/customer-chair.png", alt: "Cocoa Lounge Chair in a customer's living room" },
  ] as const,
};

export const services = {
  eyebrow: "Why shop with us",
  title: { before: "We bring the ", highlight: "best quality", after: " to every doorstep" },
  subtitle:
    "Seamless shopping from cart to doorstep — flexible ways to pay, gift and collect, with GASENOS AI on hand whenever you need help choosing.",
  items: [
    { title: "GASENOS gift vouchers", image: "/images/services/gift-vouchers.png", href: "/help/gift-vouchers" },
    { title: "Send a gift card", image: "/images/services/gift-card.png", href: "/help/gift-cards" },
    { title: "Order online, collect in store", image: "/images/services/click-collect.png", href: "/help/click-and-collect" },
    { title: "Pay in easy instalments", image: "/images/services/instalments.png", href: "/help/instalments" },
    { title: "Express home delivery", image: "/images/services/express-delivery.png", href: "/policies/shipping" },
  ],
};

export const perks = [
  { icon: "truck", title: "Free delivery", text: "On orders over ৳6,000" },
  { icon: "return", title: "30-day returns", text: "Hassle-free refunds" },
  { icon: "lock", title: "Secure payment", text: "Cards, bKash, Nagad, COD" },
  { icon: "support", title: "24/7 support", text: "Real people + GASENOS AI" },
] as const;

export const newsletter = {
  pill: "Get 10% off your first order",
  title: ["Join the list.", "Shop first."],
  text: "New drops, members-only deals and AI-picked recommendations — straight to your inbox. No spam, unsubscribe any time.",
  formTitle: "Stay in the loop",
  consent: "I'd like to hear about deals and new arrivals",
  cta: "Subscribe",
};
