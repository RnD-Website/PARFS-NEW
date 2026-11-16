/** PARFS main menu (slide-in panel opened from the header's menu icon), after louisvuitton.com's. */
const IMG = "/images/parfs";

export const menuGroups = [
  {
    title: "Fragrance",
    links: [
      { label: "All fragrances", href: "/collection" },
      { label: "The Nocturne edit", href: "/#collection" },
      { label: "Noir Absolu", href: "/products/noir-absolu" },
      { label: "Rose Lumière", href: "/products/rose-lumiere" },
      { label: "Émeraude", href: "/products/emeraude" },
    ],
  },
  {
    title: "The Maison",
    links: [
      { label: "Our story", href: "/#maison" },
      { label: "Private consultation", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const menuTiles = [
  { label: "Noir Absolu", href: "/products/noir-absolu", image: `${IMG}/product-1.webp` },
  { label: "Rose Lumière", href: "/products/rose-lumiere", image: `${IMG}/product-2b.webp` },
  { label: "The ritual", href: "/#collection", image: `${IMG}/ritual-poster.jpg` },
  { label: "Ambre Nuit", href: "/products/ambre-nuit", image: `${IMG}/hero-left-v3.webp` },
  { label: "Émeraude", href: "/products/emeraude", image: `${IMG}/product-3.webp` },
  { label: "Boxed like an heirloom", href: "/products/nocturne", image: `${IMG}/hero-center-v2.jpg` },
];
