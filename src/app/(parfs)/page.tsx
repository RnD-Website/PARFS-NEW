import type { Metadata } from "next";
import { commerce } from "@/lib/commerce";
import type { ProductSummary } from "@/lib/commerce/types";
import { parfsProducts } from "@/content/parfs-home";
import { ParfsHero } from "@/components/parfs/sections/hero";
import { ParfsNocturne } from "@/components/parfs/sections/nocturne";
import { ParfsAnatomy } from "@/components/parfs/sections/anatomy";
import { ParfsCollection } from "@/components/parfs/sections/collection";
import { ParfsFilm } from "@/components/parfs/sections/film";
import { ParfsReviews } from "@/components/parfs/sections/reviews";
import { ParfsPromise } from "@/components/parfs/sections/promise";

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: "PARFS — Maison de Parfum · Nocturne, the new collection" },
  description: "PARFS — scent for every soul. Discover Nocturne, the new collection: Noir Absolu, Rose Lumière and Émeraude.",
  openGraph: {
    title: "PARFS — Maison de Parfum",
    description: "Scent for every soul. Discover Nocturne, the new collection.",
    images: [{ url: "/images/parfs/hero-center-v2.jpg", width: 716, height: 900, alt: "PARFS eau de parfum" }],
  },
};

/** Catalogue products behind the PARFS cards, so "Add to bag" uses the real cart. */
async function loadProducts(): Promise<Record<string, ProductSummary>> {
  try {
    const page = await commerce.getProducts({ slugs: parfsProducts.map((p) => p.slug), pageSize: 12 });
    return Object.fromEntries(page.items.map((p) => [p.slug, p]));
  } catch {
    return {}; // database unavailable — the page still renders; buttons fall back to /shop
  }
}

export default async function ParfsHomePage() {
  const products = await loadProducts();

  return (
    <>
      <ParfsHero />
      <ParfsNocturne />
      <ParfsAnatomy />
      <ParfsCollection products={products} />
      <ParfsFilm />
      <ParfsReviews />
      <ParfsPromise />
    </>
  );
}
