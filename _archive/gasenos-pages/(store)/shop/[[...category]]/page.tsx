import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import { ProductListing } from "@/components/catalog/product-listing";
import { parseListingParams, type SearchParams } from "@/components/catalog/query";

type Props = { params: Promise<{ category?: string[] }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).category?.[0];
  if (!slug) return { title: "Shop all products", alternates: { canonical: "/shop" } };
  const cat = await commerce.getCategory(slug);
  return cat ? { title: `${cat.name}`, description: `Shop ${cat.name.toLowerCase()} at GASENOS.`, alternates: { canonical: `/shop/${slug}` } } : {};
}

export default async function ShopPage({ params, searchParams }: Props) {
  const { category } = await params;
  if (category && category.length > 1) notFound();
  const slug = category?.[0];
  const sp = await searchParams;
  const cat = slug ? await commerce.getCategory(slug) : null;
  if (slug && !cat) notFound();
  const query = { ...parseListingParams(sp), category: slug };
  return (
    <ProductListing
      title={cat ? cat.name : "Shop all products"}
      eyebrow={cat ? "Category" : "Shop"}
      description={cat?.description ?? undefined}
      query={query}
      basePath="shop"
      pathname={slug ? `/shop/${slug}` : "/shop"}
      rawParams={sp}
      crumbs={[{ name: "Home", href: "/" }, { name: "Shop", href: "/shop" }, ...(cat ? [{ name: cat.name, href: `/shop/${cat.slug}` }] : [])]}
    />
  );
}
