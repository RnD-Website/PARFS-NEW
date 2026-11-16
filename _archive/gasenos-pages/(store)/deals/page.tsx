import type { Metadata } from "next";
import { ProductListing } from "@/components/catalog/product-listing";
import { parseListingParams, type SearchParams } from "@/components/catalog/query";

export const metadata: Metadata = { title: "Deals", description: "Save on selected tech, fashion & home picks at GASENOS.", alternates: { canonical: "/deals" } };

export default async function DealsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  return (
    <ProductListing
      title="Deals"
      eyebrow="On sale now"
      description="Save on selected tech, fashion & home picks."
      query={{ ...parseListingParams(sp), onSale: true }}
      basePath="deals"
      pathname="/deals"
      rawParams={sp}
      crumbs={[{ name: "Home", href: "/" }, { name: "Deals", href: "/deals" }]}
    />
  );
}
