/**
 * Seed catalogue — taken from the products shown in the Figma design.
 *
 * This is the single source of initial product data. `prisma/seed.ts` loads it into
 * PostgreSQL; the storefront then reads exclusively through the CommerceProvider, so
 * moving to Shopify or a CMS later does not touch any page.
 *
 * Prices: the design shows USD. GASENOS sells in BDT, so the design prices were
 * converted at a fixed ৳120 = $1 as PLACEHOLDERS. Replace with real BDT prices.
 * Descriptions are intentionally empty (`null`) — the design does not contain them and
 * we do not invent product copy.
 */

import { parfsCatalog } from "../content/parfs-catalog";

export const USD_TO_BDT_PLACEHOLDER_RATE = 120;
const bdt = (usd: number) => usd * USD_TO_BDT_PLACEHOLDER_RATE * 100; // → poisha

export type SeedCategory = {
  slug: string;
  name: string;
  shortName: string;
  image: string;
  sortOrder: number;
};

export const categories: SeedCategory[] = [
  { slug: "electronics", name: "Electronics", shortName: "Electronics", image: "/images/categories/electronics.png", sortOrder: 1 },
  { slug: "fashion", name: "Fashion", shortName: "Fashion", image: "/images/categories/fashion.png", sortOrder: 2 },
  { slug: "home-living", name: "Home & Living", shortName: "Home", image: "/images/categories/home-living.png", sortOrder: 3 },
  { slug: "beauty", name: "Beauty", shortName: "Beauty", image: "/images/categories/beauty.png", sortOrder: 4 },
  { slug: "footwear", name: "Footwear", shortName: "Footwear", image: "/images/categories/footwear.png", sortOrder: 5 },
  { slug: "audio", name: "Audio", shortName: "Audio", image: "/images/categories/audio.png", sortOrder: 6 },
  { slug: "fragrance", name: "Fragrance", shortName: "Fragrance", image: "/images/parfs/product-1.webp", sortOrder: 7 },
];

export type SeedOption = {
  name: "Color" | "Size";
  values: { label: string; value: string; swatch?: string }[];
};

export type SeedProduct = {
  slug: string;
  name: string;
  /** First category is the one shown on product cards (matches the design labels). */
  categories: string[];
  priceUsd: number;
  compareAtUsd?: number;
  rating?: { average: number; count: number };
  badges?: ("sale" | "new" | "ai-pick")[];
  highlights?: string[];
  tags: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  sortOrder: number;
  images: { src: string; alt: string }[];
  options?: SeedOption[];
  attributes?: Record<string, string>;
  /** Default stock per variant — PLACEHOLDER until inventory is connected. */
  stock?: number;
};

export const products: SeedProduct[] = [
  {
    slug: "aero-runner-x",
    name: "Aero Runner X Sneaker",
    categories: ["fashion", "footwear"],
    priceUsd: 129,
    compareAtUsd: 159,
    rating: { average: 4.8, count: 212 },
    badges: ["sale"],
    highlights: ["Lightest pick", "Runs true to size"],
    tags: ["running", "sneaker", "shoes", "lightweight", "everyday"],
    isFeatured: true,
    isBestSeller: true,
    sortOrder: 1,
    images: [
      { src: "/images/products/aero-runner-x-main.png", alt: "Aero Runner X sneaker in Volt Orange, side view" },
      { src: "/images/products/aero-runner-x-side.png", alt: "Aero Runner X sneaker, outer side profile" },
      { src: "/images/products/aero-runner-x-on-foot.png", alt: "Aero Runner X sneakers worn outdoors" },
      { src: "/images/products/aero-runner-x-detail.png", alt: "Close-up of the Aero Runner X knit upper" },
      { src: "/images/products/aero-runner-x.png", alt: "Aero Runner X sneaker" },
    ],
    options: [
      {
        name: "Color",
        values: [
          { label: "Volt Orange", value: "volt-orange", swatch: "#ff4d1a" },
          { label: "Black", value: "black", swatch: "#1c1a17" },
          { label: "Grey", value: "grey", swatch: "#6e6356" },
          { label: "Off-white", value: "off-white", swatch: "#d9cfc0" },
        ],
      },
      {
        name: "Size",
        values: ["39", "40", "41", "42", "43", "44"].map((s) => ({ label: s, value: s })),
      },
    ],
    attributes: { "Size system": "EU" },
    stock: 10,
  },
  {
    slug: "studio-max-headphones",
    name: "Studio Max Headphones",
    categories: ["electronics", "audio"],
    priceUsd: 249,
    rating: { average: 4.7, count: 184 },
    badges: ["ai-pick"],
    tags: ["headphones", "over-ear", "audio", "music", "commute"],
    isNew: true,
    isBestSeller: true,
    sortOrder: 2,
    images: [{ src: "/images/products/studio-max-headphones.png", alt: "Studio Max Headphones in cream" }],
    stock: 10,
  },
  {
    slug: "pulse-buds-pro",
    name: "Pulse Buds Pro",
    categories: ["electronics", "audio"],
    priceUsd: 119,
    compareAtUsd: 149,
    rating: { average: 4.6, count: 96 },
    badges: ["sale"],
    tags: ["earbuds", "wireless", "audio", "gym", "workout"],
    isBestSeller: true,
    sortOrder: 3,
    images: [{ src: "/images/products/pulse-buds-pro.png", alt: "Pulse Buds Pro wireless earbuds with charging case" }],
    stock: 10,
  },
  {
    slug: "orbit-watch-s2",
    name: "Orbit Watch S2",
    categories: ["electronics"],
    priceUsd: 199,
    rating: { average: 4.7, count: 143 },
    tags: ["smartwatch", "watch", "fitness", "wearable"],
    isBestSeller: true,
    sortOrder: 4,
    images: [{ src: "/images/products/orbit-watch-s2.png", alt: "Orbit Watch S2 smartwatch with black strap" }],
    stock: 10,
  },
  {
    slug: "cocoa-lounge-chair",
    name: "Cocoa Lounge Chair",
    categories: ["home-living"],
    priceUsd: 389,
    rating: { average: 4.9, count: 58 },
    badges: ["new"],
    tags: ["chair", "lounge", "furniture", "reading corner", "living room"],
    isNew: true,
    isBestSeller: true,
    sortOrder: 5,
    images: [{ src: "/images/products/cocoa-lounge-chair.png", alt: "Cocoa Lounge Chair in brown bouclé" }],
    stock: 10,
  },
  {
    slug: "glow-ritual-serum-set",
    name: "Glow Ritual Serum Set",
    categories: ["beauty"],
    priceUsd: 54,
    compareAtUsd: 68,
    rating: { average: 4.8, count: 321 },
    badges: ["sale"],
    tags: ["serum", "skincare", "beauty", "gift set"],
    isBestSeller: true,
    sortOrder: 6,
    images: [{ src: "/images/products/glow-ritual-serum-set.png", alt: "Glow Ritual Serum Set — three amber bottles" }],
    stock: 10,
  },
  {
    slug: "halo-bluetooth-speaker",
    name: "Halo Bluetooth Speaker",
    categories: ["electronics", "audio"],
    priceUsd: 89,
    rating: { average: 4.5, count: 77 },
    tags: ["speaker", "bluetooth", "portable", "audio"],
    isBestSeller: true,
    sortOrder: 7,
    images: [{ src: "/images/products/halo-bluetooth-speaker.png", alt: "Halo Bluetooth Speaker with orange strap" }],
    stock: 10,
  },
  {
    slug: "ember-oversized-jacket",
    name: "Ember Oversized Jacket",
    categories: ["fashion"],
    priceUsd: 72,
    rating: { average: 4.6, count: 64 },
    badges: ["ai-pick"],
    tags: ["jacket", "outerwear", "oversized", "orange"],
    isBestSeller: true,
    sortOrder: 8,
    images: [{ src: "/images/products/ember-oversized-jacket.png", alt: "Ember Oversized Jacket in orange" }],
    stock: 10,
  },
  {
    slug: "cloud-stride-2",
    name: "Cloud Stride 2",
    categories: ["footwear"],
    priceUsd: 145,
    highlights: ["Extra cushioning for longer runs"],
    tags: ["running", "sneaker", "shoes", "cushioning", "long distance"],
    sortOrder: 9,
    images: [{ src: "/images/products/ai-cloud-stride-2.png", alt: "Cloud Stride 2 running shoe in light grey" }],
    options: [{ name: "Size", values: ["39", "40", "41", "42", "43", "44"].map((s) => ({ label: s, value: s })) }],
    attributes: { "Size system": "EU" },
    stock: 10,
  },
  {
    slug: "pace-lite",
    name: "Pace Lite",
    categories: ["footwear"],
    priceUsd: 98,
    highlights: ["Best value", "Breathable mesh"],
    tags: ["running", "sneaker", "shoes", "budget", "breathable", "mesh"],
    sortOrder: 10,
    images: [{ src: "/images/products/ai-pace-lite.png", alt: "Pace Lite running shoe in black" }],
    options: [{ name: "Size", values: ["39", "40", "41", "42", "43", "44"].map((s) => ({ label: s, value: s })) }],
    attributes: { "Size system": "EU" },
    stock: 10,
  },
  // ── PARFS — The Nocturne Edit (from the PARFS Figma home page) ──
  {
    slug: "noir-absolu",
    name: "Noir Absolu",
    categories: ["fragrance", "beauty"],
    priceUsd: 185,
    tags: ["parfs", "fragrance", "perfume", "edp", "oud", "leather", "black pepper", "nocturne"],
    highlights: ["Oud · Leather · Black pepper", "EDP — 100 ml"],
    isFeatured: true,
    sortOrder: 101,
    images: [{ src: "/images/parfs/product-1.webp", alt: "Noir Absolu eau de parfum, round fluted PARFS bottle with a faceted crystal cap on driftwood" }],
    attributes: { Concentration: "Eau de Parfum", Volume: "100 ml" },
    stock: 10,
  },
  {
    slug: "rose-lumiere",
    name: "Rose Lumière",
    categories: ["fragrance", "beauty"],
    priceUsd: 160,
    tags: ["parfs", "fragrance", "perfume", "edp", "rose", "lychee", "white musk", "nocturne"],
    highlights: ["Damask rose · Lychee · White musk", "EDP — 75 ml"],
    sortOrder: 102,
    images: [{ src: "/images/parfs/product-2b.webp", alt: "Rose Lumière eau de parfum, square amber PARFS bottle on a stone with white blossoms" }],
    attributes: { Concentration: "Eau de Parfum", Volume: "75 ml" },
    stock: 10,
  },
  {
    slug: "emeraude",
    name: "Émeraude",
    categories: ["fragrance", "beauty"],
    priceUsd: 170,
    tags: ["parfs", "fragrance", "perfume", "extrait", "fig leaf", "vetiver", "cedarwood", "nocturne"],
    highlights: ["Fig leaf · Vetiver · Cedarwood", "Extrait — 50 ml"],
    sortOrder: 103,
    images: [{ src: "/images/parfs/product-3.webp", alt: "Émeraude extrait, amber PARFS bottle on driftwood beneath a dry leafy branch" }],
    attributes: { Concentration: "Extrait de Parfum", Volume: "50 ml" },
    stock: 10,
  },
  // ── PARFS — collection placeholders (dummy scents from src/content/parfs-catalog.ts) ──
  // Generated from the collection content so the store and the /collection page always match.
  // Delete these (or the `placeholder: true` items there) when the real products arrive.
  ...parfsCatalog
    .filter((c) => c.placeholder)
    .map(
      (c, i): SeedProduct => ({
        slug: c.slug,
        name: c.name,
        categories: ["fragrance", "beauty"],
        priceUsd: c.price,
        tags: ["parfs", "fragrance", "perfume", c.concentration === "Extrait de Parfum" ? "extrait" : "edp", c.family.toLowerCase(), ...c.notes.toLowerCase().split(" · ")],
        highlights: [c.notes, `${c.concentration === "Extrait de Parfum" ? "Extrait" : "EDP"} — ${c.volume}`],
        isNew: c.tag === "New",
        isBestSeller: c.tag === "Bestseller",
        sortOrder: 110 + i,
        images: [
          { src: c.image, alt: c.imageAlt },
          { src: c.hover, alt: `${c.name} — PARFS` },
        ],
        attributes: { Concentration: c.concentration, Volume: c.volume, Family: c.family },
        stock: 10,
      }),
    ),
];

export const seedPrice = (p: SeedProduct) => ({
  price: bdt(p.priceUsd),
  compareAtPrice: p.compareAtUsd ? bdt(p.compareAtUsd) : null,
});
