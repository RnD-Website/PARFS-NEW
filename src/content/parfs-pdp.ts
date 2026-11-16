/**
 * PARFS product details page copy.
 * Facts come from the Figma file / catalogue (notes, concentration, volume, bottle anatomy).
 * Marked PLACEHOLDER = wording written for the layout — replace with your own.
 */

const IMG = "/images/parfs";

export type PdpMedia = { src: string; alt: string; fit?: "cover" | "contain"; dark?: boolean };

/** Per-product extras, keyed by catalogue slug. Gallery photos beyond the first are shared brand shots for now. */
export const pdpProducts: Record<string, { tagline: string; gallery: PdpMedia[] }> = {
  "noir-absolu": {
    tagline: "Warm, smoky and still there the next morning.", // PLACEHOLDER (adapted from a client review)
    gallery: [
      { src: `${IMG}/product-1.webp`, alt: "Noir Absolu — round fluted PARFS bottle on driftwood" },
      { src: `${IMG}/trio-wood.jpg`, alt: "Three bottles on a wooden plinth" },
      { src: `${IMG}/ritual-poster.jpg`, alt: "Applying PARFS to the wrist" },
      { src: `${IMG}/anatomy-exploded-v2.webp`, alt: "Exploded view of a PARFS bottle", fit: "contain", dark: true },
    ],
  },
  "rose-lumiere": {
    tagline: "Soft without being sweet — it simply moves with the day.", // PLACEHOLDER (adapted from a client review)
    gallery: [
      { src: `${IMG}/product-2b.webp`, alt: "Rose Lumière — square amber PARFS bottle on a stone with white blossoms" },
      { src: `${IMG}/trio-wood.jpg`, alt: "Three bottles on a wooden plinth" },
      { src: `${IMG}/promise-bg-3.webp`, alt: "Holding a PARFS bottle" },
      { src: `${IMG}/anatomy-exploded-v2.webp`, alt: "Exploded view of a PARFS bottle", fit: "contain", dark: true },
    ],
  },
  emeraude: {
    tagline: "Green, calm and quietly confident.", // PLACEHOLDER (adapted from a client review)
    gallery: [
      { src: `${IMG}/product-3.webp`, alt: "Émeraude — amber PARFS bottle on driftwood beneath a leafy branch" },
      { src: `${IMG}/trio-wood.jpg`, alt: "Three bottles on a wooden plinth" },
      { src: `${IMG}/ritual-poster.jpg`, alt: "Applying PARFS to the wrist" },
      { src: `${IMG}/anatomy-exploded-v2.webp`, alt: "Exploded view of a PARFS bottle", fit: "contain", dark: true },
    ],
  },
};

/** Shared across every PARFS fragrance (from the Anatomy section of the design). */
export const pdpComposition = [
  "18% perfume concentrate",
  "Weighted smoked glass, cut from 1.2 kg of glass",
  "Solid brass cap and hand-polished collar",
  "Fine-mist atomiser — 0.07 ml per spray",
  "Refillable and engravable",
];

export const pdpCare = "Keep the bottle upright, closed and away from direct sunlight and heat."; // PLACEHOLDER

export const pdpStatement = "Three scents, one signature. Find the one that moves with your day."; // PLACEHOLDER

export const pdpMeet = {
  label: "Meet the bottle",
  tabs: [
    {
      key: "use",
      title: "In use",
      text: "A fine-mist atomiser releases 0.07 ml per spray — enough to wear, never to overwhelm.",
      media: { kind: "video" as const, src: "/videos/parfs-ritual.mp4", poster: `${IMG}/ritual-poster.jpg` },
    },
    {
      key: "anatomy",
      title: "The anatomy",
      text: "Every PARFS bottle is cut from 1.2 kg of weighted glass and capped in solid brass.",
      media: { kind: "image" as const, src: `${IMG}/anatomy-exploded-v2.webp`, alt: "Exploded view of a PARFS bottle", fit: "contain" as const },
    },
    {
      key: "scent",
      title: "The scent",
      text: "", // filled per product with its notes
      media: { kind: "product" as const },
    },
  ],
};
