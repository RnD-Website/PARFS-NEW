import type { Metadata } from "next";
import { ProductListing } from "@/components/catalog/product-listing";
import { parseListingParams, type SearchParams } from "@/components/catalog/query";

export const metadata: Metadata = { title: "New in", description: "The latest drops at GASENOS.", alternates: { canonical: "/new" } };

export default async function NewPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return (
    <ProductListing
      title="New in"
      eyebrow="Just dropped"
      query={{ ...parseListingParams(sp), isNew: true }}
      basePath="new"
      pathname="/new"
      rawParams={sp}
      crumbs={[{ name: "Home", href: "/" }, { name: "New in", href: "/new" }]}
    />
  );
}
