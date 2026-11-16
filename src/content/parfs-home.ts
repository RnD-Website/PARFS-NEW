/**
 * PARFS home page copy — taken verbatim from the Figma file
 * "PARFS E-commerce Website Design" → Website design → Home Page — v3.
 *
 * Edit text here; the components only render it.
 */

const IMG = "/images/parfs";

export const parfsNav = [
  { no: "01", label: "Collection", href: "/collection" },
  { no: "02", label: "The Maison", href: "/#maison" },
  { no: "03", label: "Consultation", href: "/contact" },
] as const;

export const parfsHero = {
  panels: {
    left: { src: `${IMG}/hero-left-v4.webp`, alt: "Round amber PARFS eau de parfum bottle with a gold cap, reflected in water between dark sand dunes" },
    center: { src: `${IMG}/hero-center-v2.jpg`, alt: "PARFS eau de parfum bottle beside its black art-deco gift box" },
    right: { src: `${IMG}/hero-right-v2.jpg`, alt: "Square amber PARFS bottle on a stone with white blossoms and driftwood" },
  },
  collection: ["N°01 — Nocturne", "The new collection — 2026"],
  cta: { label: "Enter the Maison", href: "#maison" },
};

export const parfsCode = {
  title: "The Parfs Code",
  headline: ["Scent for Every", "Soul"],
  body: ["Every skin. Every ritual.", "Fragrance without boundaries."],
  step: "[ 01 / 06 ]  Scent for every soul",
  /** Marker positions on the arch, in design px relative to the 1440-wide section. */
  markers: [
    { n: 1, x: 356.76, y: 394.07, active: true },
    { n: 2, x: 498.98, y: 313.96 },
    { n: 3, x: 658.33, y: 274.23 },
    { n: 4, x: 781.67, y: 274.23 },
    { n: 5, x: 941.02, y: 313.96 },
    { n: 6, x: 1083.24, y: 396.07 },
  ],
};

export const parfsNocturne = {
  word: "PARFS",
  bottle: { src: `${IMG}/nocturne-bottle-parfs.png`, alt: "PARFS eau de parfum, square amber glass bottle with a gold collar and clear cap", width: 762, height: 804 },
  links: [
    { tag: "[01] Signature", name: "Nocturne Eau de Parfum", href: "/products/nocturne" },
    { tag: "[02] Intense", name: "Ambre Nuit Extrait", href: "/products/ambre-nuit" },
  ],
  ingredients: [
    { name: "Calabrian Bergamot", icon: `${IMG}/ing-bergamot.svg` },
    { name: "Jasmine Sambac", icon: `${IMG}/ing-jasmine.svg` },
    { name: "Laotian Oud", icon: `${IMG}/ing-oud.svg` },
    { name: "Baltic Amber", icon: `${IMG}/ing-amber.svg` },
    { name: "Madagascan Vanilla", icon: `${IMG}/ing-vanilla.svg` },
  ],
  caption: "Explore our signature ingredients",
};

export const parfsAnatomy = {
  label: { no: "[02]", text: "The anatomy of a bottle" },
  statement: "A vessel engineered to hold a memory — and release it slowly.",
  spec: "Every PARFS bottle is cut from 1.2 kg of weighted glass and capped in solid brass. A fine-mist atomiser releases 0.07 ml per spray — enough to wear, never to overwhelm.",
  image: { src: `${IMG}/anatomy-exploded-v2.webp`, alt: "Exploded view of the Nocturne 100 ml bottle: brass cap, atomiser, collar, perfume sphere and smoked glass base" },
  /** In bottle order, top to bottom — each label points at the matching part of the exploded view. */
  hotspots: [
    { no: "[01]", label: "Solid brass cap" },
    { no: "[02]", label: "Fine-mist atomiser" },
    { no: "[03]", label: "Hand-polished collar" },
    { no: "[04]", label: "18% perfume concentrate" },
    { no: "[05]", label: "Weighted smoked glass" },
  ],
};

export type ParfsProduct = {
  slug: string;
  no: string;
  name: string;
  notes: string;
  meta: string;
  /** Display price exactly as designed. The cart charges the store's catalogue price. */
  price: string;
  image: string;
  imageAlt: string;
  configurator: string;
};

export const parfsProducts: ParfsProduct[] = [
  {
    slug: "noir-absolu",
    no: "N°01",
    name: "Noir Absolu",
    notes: "Oud · Leather · Black pepper",
    meta: "EDP — 100 ml",
    price: "$185",
    image: `${IMG}/product-1.webp`,
    imageAlt: "Noir Absolu — round fluted PARFS bottle with a faceted crystal cap, resting on driftwood",
    configurator: `${IMG}/config-noir-absolu.png`,
  },
  {
    slug: "rose-lumiere",
    no: "N°02",
    name: "Rose Lumière",
    notes: "Damask rose · Lychee · White musk",
    meta: "EDP — 75 ml",
    price: "$160",
    image: `${IMG}/product-2b.webp`,
    imageAlt: "Rose Lumière — square amber PARFS bottle on a stone with white blossoms",
    configurator: `${IMG}/config-rose-lumiere.png`,
  },
  {
    slug: "emeraude",
    no: "N°03",
    name: "Émeraude",
    notes: "Fig leaf · Vetiver · Cedarwood",
    meta: "Extrait — 50 ml",
    price: "$170",
    image: `${IMG}/product-3.webp`,
    imageAlt: "Émeraude — amber PARFS bottle on driftwood beneath a dry leafy branch",
    configurator: `${IMG}/config-emeraude.png`,
  },
];

export const parfsCollection = {
  label: { no: "[03]", text: "The collection" },
  title: ["The Nocturne", "Edit"],
  cta: { label: "Discover the full collection", href: "/collection" },
};

/** Brand film between The Collection and the configurator. Labels are placeholders — edit freely. */
export const parfsFilm = {
  src: "/videos/parfs-ritual.mp4",
  poster: `${IMG}/ritual-poster.jpg`,
  label: { no: "[04]", text: "The ritual" },
  caption: "N°01 — Nocturne · The film",
};

export const parfsReviews = {
  eyebrow: "What our clients say",
  title: ["REVIEWS THAT", "LINGER"],
  /** Only the three reviews in the design — add more here and the counter updates. */
  items: [
    {
      name: "Amira K.",
      location: "Dhaka, Bangladesh",
      text: "I've tried every niche house in the city. Noir Absolu is the first fragrance people ask me about — warm, smoky and still there the next morning. It feels made for me.",
    },
    {
      name: "Daniel M.",
      location: "Dubai, UAE",
      text: "The atelier helped me choose a scent in a consultation call. Émeraude now feels like my signature — green, calm and quietly confident.",
    },
    {
      name: "Sofia R.",
      location: "London, United Kingdom",
      text: "Rose Lumière is soft without being sweet. I wear it to work and to dinner — it simply moves with the day. The bottle alone is a piece of art.",
    },
  ],
};

/** Pinned "promise" section before the footer. Copy drawn from elsewhere on the site — edit freely. */
export const parfsPromise = {
  image: { src: `${IMG}/promise-bg-3.webp`, alt: "Smiling woman holding a square amber PARFS bottle against warm tan drapery" },
  headline: ["Scent for", "every soul"],
  title: "Find your signature scent",
  points: ["18% perfume concentrate", "Refillable, engravable bottle", "Hand-polished brass hardware"],
  cta: { label: "Get all collections", href: "/collection" },
};

export const parfsFooter = {
  contact: { title: "Contact us", email: "hello@parfs.com", phone: "+880 1700 000 000" },
  subscribe: { title: "Subscribe to the Maison", sub: "Early access · Private launches · Rituals" },
  socials: [
    { label: "Instagram", href: null as string | null },
    { label: "TikTok", href: null as string | null },
    { label: "Pinterest", href: null as string | null },
  ],
  legals: [
    { label: "Terms", href: "/legal/terms" },
    { label: "Privacy policy", href: "/legal/privacy" },
    { label: "Cookies", href: "/legal/cookies" },
    { label: "Shipping", href: "/legal/shipping" },
    { label: "Returns", href: "/legal/returns" },
  ],
  copyright: "© PARFS 2026 — All rights reserved",
  region: "International — English",
};
