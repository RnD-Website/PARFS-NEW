import type { Metadata } from "next";
import { parfsCatalog } from "@/content/parfs-catalog";
import { CollectionView } from "@/components/parfs/collection/collection-view";

export const metadata: Metadata = {
  title: { absolute: "The collection — PARFS" },
  description: "Every PARFS fragrance — woody, floral, amber and fresh, in eau de parfum and extrait.",
  alternates: { canonical: "/collection" },
};

/** PARFS collection page, laid out after étoile.com/collections/all. `?page=2` opens on that page. */
export default async function CollectionPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const raw = (await searchParams).page;
  const n = Number(Array.isArray(raw) ? raw[0] : raw);
  return <CollectionView items={parfsCatalog} initialPage={Number.isInteger(n) && n > 0 ? n : 1} />;
}
