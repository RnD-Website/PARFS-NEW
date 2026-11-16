/**
 * PARFS full collection (for /collection).
 *
 * The first three are the real fragrances (also in the catalogue database, so "Add to bag" works).
 * Everything marked `placeholder: true` is DUMMY content — invented names/notes/prices and re-used
 * photos — to fill the grid until the real products arrive. Replace or delete them freely.
 */

const IMG = "/images/parfs";

export type Family = "Woody" | "Floral" | "Amber" | "Fresh";
export type Concentration = "Eau de Parfum" | "Extrait de Parfum";

export type CatalogItem = {
  slug: string;
  name: string;
  family: Family;
  concentration: Concentration;
  volume: string;
  /** USD, as shown in the design. */
  price: number;
  notes: string;
  image: string;
  imageAlt: string;
  /** Second photo — shown on hover, and in "Campaign" view. */
  hover: string;
  tag?: "New" | "Bestseller" | "Limited";
  placeholder?: boolean;
};

export const catalogFamilies: Family[] = ["Woody", "Floral", "Amber", "Fresh"];
export const catalogConcentrations: Concentration[] = ["Eau de Parfum", "Extrait de Parfum"];

export const parfsCatalog: CatalogItem[] = [
  {
    slug: "noir-absolu",
    name: "Noir Absolu",
    family: "Woody",
    concentration: "Eau de Parfum",
    volume: "100 ml",
    price: 185,
    notes: "Oud · Leather · Black pepper",
    image: `${IMG}/product-1.webp`,
    imageAlt: "Noir Absolu — round fluted PARFS bottle on driftwood",
    hover: `${IMG}/ritual-poster.jpg`,
    tag: "Bestseller",
  },
  {
    slug: "rose-lumiere",
    name: "Rose Lumière",
    family: "Floral",
    concentration: "Eau de Parfum",
    volume: "75 ml",
    price: 160,
    notes: "Damask rose · Lychee · White musk",
    image: `${IMG}/product-2b.webp`,
    imageAlt: "Rose Lumière — square amber PARFS bottle on a stone with white blossoms",
    hover: `${IMG}/promise-bg-3.webp`,
  },
  {
    slug: "emeraude",
    name: "Émeraude",
    family: "Fresh",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 170,
    notes: "Fig leaf · Vetiver · Cedarwood",
    image: `${IMG}/product-3.webp`,
    imageAlt: "Émeraude — amber PARFS bottle on driftwood beneath a leafy branch",
    hover: `${IMG}/trio-wood.jpg`,
    tag: "New",
  },
  // ── Dummy products below ─────────────────────────────────────────────
  {
    slug: "ambre-nuit",
    name: "Ambre Nuit",
    family: "Amber",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 195,
    notes: "Baltic amber · Madagascan vanilla · Labdanum",
    image: `${IMG}/hero-left-v3.webp`,
    imageAlt: "Round amber PARFS bottle with a gold cap, reflected in water between sand dunes",
    hover: `${IMG}/hero-left-v2.jpg`,
    tag: "Limited",
    placeholder: true,
  },
  {
    slug: "nocturne",
    name: "Nocturne",
    family: "Woody",
    concentration: "Eau de Parfum",
    volume: "100 ml",
    price: 180,
    notes: "Calabrian bergamot · Jasmine sambac · Laotian oud",
    image: `${IMG}/hero-center-v2.jpg`,
    imageAlt: "PARFS bottle beside its black art-deco gift box",
    hover: `${IMG}/hero-left-v2.jpg`,
    placeholder: true,
  },
  {
    slug: "lumiere-doree",
    name: "Lumière Dorée",
    family: "Amber",
    concentration: "Eau de Parfum",
    volume: "75 ml",
    price: 150,
    notes: "Saffron · Honey · Benzoin",
    image: `${IMG}/hero-right-v2.jpg`,
    imageAlt: "Square amber PARFS bottle on a stone with white blossoms",
    hover: `${IMG}/promise-bg-3.webp`,
    placeholder: true,
  },
  {
    slug: "jardin-blanc",
    name: "Jardin Blanc",
    family: "Floral",
    concentration: "Eau de Parfum",
    volume: "75 ml",
    price: 145,
    notes: "Orange blossom · Tuberose · Neroli",
    image: `${IMG}/product-2b.webp`,
    imageAlt: "Amber PARFS bottle with white blossoms",
    hover: `${IMG}/hero-right-v2.jpg`,
    tag: "New",
    placeholder: true,
  },
  {
    slug: "bois-sacre",
    name: "Bois Sacré",
    family: "Woody",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 205,
    notes: "Sandalwood · Incense · Cardamom",
    image: `${IMG}/product-1.webp`,
    imageAlt: "Round PARFS bottle on driftwood",
    hover: `${IMG}/trio-wood.jpg`,
    placeholder: true,
  },
  {
    slug: "vetiver-de-pluie",
    name: "Vétiver de Pluie",
    family: "Fresh",
    concentration: "Eau de Parfum",
    volume: "100 ml",
    price: 155,
    notes: "Vetiver · Grapefruit · Wet stone",
    image: `${IMG}/product-3.webp`,
    imageAlt: "Amber PARFS bottle on driftwood with a leafy branch",
    hover: `${IMG}/ritual-poster.jpg`,
    placeholder: true,
  },
  {
    slug: "velours-noir",
    name: "Velours Noir",
    family: "Amber",
    concentration: "Extrait de Parfum",
    volume: "50 ml",
    price: 210,
    notes: "Black plum · Tonka · Suede",
    image: `${IMG}/hero-left-v2.jpg`,
    imageAlt: "Faceted black PARFS bottle with a brass cap",
    hover: `${IMG}/hero-center-v2.jpg`,
    placeholder: true,
  },
  {
    slug: "pivoine-de-soie",
    name: "Pivoine de Soie",
    family: "Floral",
    concentration: "Eau de Parfum",
    volume: "75 ml",
    price: 150,
    notes: "Peony · Pink pepper · Cashmere musk",
    image: `${IMG}/promise-bg-3.webp`,
    imageAlt: "Holding a PARFS bottle against warm drapery",
    hover: `${IMG}/product-2b.webp`,
    placeholder: true,
  },
  {
    slug: "cedre-azur",
    name: "Cèdre Azur",
    family: "Fresh",
    concentration: "Eau de Parfum",
    volume: "100 ml",
    price: 140,
    notes: "Atlas cedar · Sea salt · Bergamot",
    image: `${IMG}/hero-right-v2.jpg`,
    imageAlt: "PARFS bottle on a stone with blossoms",
    hover: `${IMG}/product-3.webp`,
    placeholder: true,
  },
  // More dummy products (generated from a compact list so they're quick to replace or delete).
  ...(
    [
      ["oud-imperial", "Oud Impérial", "Woody", "Extrait de Parfum", "50 ml", 240, "Cambodian oud · Rose absolute · Saffron", "hero-left-v4.webp", "trio-wood.jpg", "Limited"],
      ["santal-blond", "Santal Blond", "Woody", "Eau de Parfum", "100 ml", 175, "Mysore sandalwood · Fig milk · Cream", "product-3.webp", "promise-bg-3.webp"],
      ["musc-velours", "Musc Velours", "Floral", "Eau de Parfum", "75 ml", 140, "White musk · Iris · Ambrette", "product-2b.webp", "ritual-poster.jpg"],
      ["iris-poudre", "Iris Poudré", "Floral", "Extrait de Parfum", "50 ml", 190, "Orris butter · Violet leaf · Suede", "hero-right-v2.jpg", "hero-left-v3.webp", "New"],
      ["neroli-soleil", "Néroli Soleil", "Fresh", "Eau de Parfum", "100 ml", 135, "Tunisian neroli · Petitgrain · Sea air", "hero-left-v3.webp", "product-3.webp"],
      ["ambre-sauvage", "Ambre Sauvage", "Amber", "Eau de Parfum", "75 ml", 165, "Amber resin · Cistus · Smoked birch", "trio-wood.jpg", "hero-center-v2.jpg"],
      ["tabac-dore", "Tabac Doré", "Amber", "Extrait de Parfum", "50 ml", 215, "Tobacco leaf · Honey · Tonka", "product-1.webp", "hero-left-v4.webp", "Bestseller"],
      ["cuir-fume", "Cuir Fumé", "Woody", "Eau de Parfum", "100 ml", 185, "Smoked leather · Birch tar · Iris", "hero-center-v2.jpg", "hero-left-v2.jpg"],
      ["figue-noire", "Figue Noire", "Fresh", "Eau de Parfum", "75 ml", 150, "Black fig · Fig leaf · Coconut wood", "product-3.webp", "hero-right-v2.jpg"],
      ["rose-noire", "Rose Noire", "Floral", "Extrait de Parfum", "50 ml", 200, "Black rose · Patchouli · Oud", "hero-left-v2.jpg", "product-2b.webp"],
      ["the-blanc", "Thé Blanc", "Fresh", "Eau de Parfum", "100 ml", 130, "White tea · Bergamot · Jasmine", "hero-right-v2.jpg", "promise-bg-3.webp"],
      ["encens-lunaire", "Encens Lunaire", "Woody", "Extrait de Parfum", "50 ml", 225, "Frankincense · Elemi · Cold stone", "hero-center-v2.jpg", "trio-wood.jpg", "New"],
      ["vanille-celeste", "Vanille Céleste", "Amber", "Eau de Parfum", "75 ml", 160, "Bourbon vanilla · Rum · Orchid", "hero-left-v3.webp", "product-1.webp"],
      ["bergamote-riviera", "Bergamote Riviera", "Fresh", "Eau de Parfum", "100 ml", 125, "Bergamot · Lemon zest · Basil", "product-2b.webp", "hero-left-v3.webp"],
      ["patchouli-nuit", "Patchouli Nuit", "Woody", "Eau de Parfum", "100 ml", 170, "Patchouli heart · Cacao · Vetiver", "hero-left-v4.webp", "ritual-poster.jpg"],
      ["myrrhe-royale", "Myrrhe Royale", "Amber", "Extrait de Parfum", "50 ml", 230, "Myrrh · Benzoin · Golden amber", "trio-wood.jpg", "hero-left-v4.webp", "Limited"],
      ["lys-sacre", "Lys Sacré", "Floral", "Eau de Parfum", "75 ml", 155, "White lily · Pink pepper · Musk", "hero-left-v2.jpg", "hero-right-v2.jpg"],
      ["ylang-dore", "Ylang Doré", "Floral", "Eau de Parfum", "75 ml", 145, "Ylang-ylang · Frangipani · Sandalwood", "promise-bg-3.webp", "product-2b.webp"],
      ["bois-d-ebene", "Bois d'Ébène", "Woody", "Extrait de Parfum", "50 ml", 210, "Ebony wood · Black pepper · Leather", "product-1.webp", "hero-center-v2.jpg"],
      ["poivre-rose", "Poivre Rose", "Fresh", "Eau de Parfum", "100 ml", 140, "Pink pepper · Grapefruit · Cedar", "product-3.webp", "trio-wood.jpg"],
      ["sel-marin", "Sel Marin", "Fresh", "Eau de Parfum", "100 ml", 135, "Sea salt · Driftwood · Sage", "hero-right-v2.jpg", "product-3.webp"],
      ["ambre-imperial", "Ambre Impérial", "Amber", "Extrait de Parfum", "50 ml", 220, "Ambergris · Labdanum · Vanilla", "hero-left-v3.webp", "hero-left-v2.jpg", "Bestseller"],
    ] as const
  ).map(
    ([slug, name, family, concentration, volume, price, notes, image, hover, tag]): CatalogItem => ({
      slug,
      name,
      family,
      concentration,
      volume,
      price,
      notes,
      image: `${IMG}/${image}`,
      imageAlt: `${name} — PARFS ${concentration.toLowerCase()}`,
      hover: `${IMG}/${hover}`,
      tag,
      placeholder: true,
    }),
  ),
];

export const collectionPage = {
  label: { no: "[01]", text: "The collection" },
  title: "Every PARFS fragrance",
  intro: "From the Nocturne edit to the extraits — each bottle cut from weighted glass and capped in solid brass.",
  more: "Every skin. Every ritual. Fragrance without boundaries. Explore the full wardrobe of PARFS scents — woody, floral, amber and fresh — in eau de parfum and extrait strengths, each made to be worn close and remembered long after.",
  /** Wide campaign tiles placed inside each page of the grid (`after` = products before it on that page; `page` is 1-based). */
  campaigns: [
    { page: 1, after: 4, image: `${IMG}/promise-bg-3.webp`, alt: "Holding a PARFS bottle", title: "Scent for every soul", cta: "Shop Rose Lumière", href: "/products/rose-lumiere" },
    { page: 1, after: 9, image: `${IMG}/ritual-poster.jpg`, alt: "Applying PARFS to the wrist", title: "The ritual, every evening", cta: "Shop Noir Absolu", href: "/products/noir-absolu" },
    { page: 2, after: 4, image: `${IMG}/hero-left-v4.webp`, alt: "Round amber PARFS bottle between dunes", title: "Amber, after dark", cta: "Shop Ambre Nuit", href: "/products/ambre-nuit" },
    { page: 2, after: 9, image: `${IMG}/hero-center-v2.jpg`, alt: "PARFS bottle beside its art-deco box", title: "Boxed like an heirloom", cta: "Shop Nocturne", href: "/products/nocturne" },
  ],
};
