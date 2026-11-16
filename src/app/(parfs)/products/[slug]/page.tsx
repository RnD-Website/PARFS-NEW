import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { commerce } from "@/lib/commerce";
import type { Product, ProductSummary } from "@/lib/commerce/types";
import { formatMoney } from "@/lib/utils/money";
import { parfsProducts } from "@/content/parfs-home";
import { pdpProducts, pdpStatement } from "@/content/parfs-pdp";
import { parfsCatalog } from "@/content/parfs-catalog";
import { JsonLd, productJsonLd } from "@/lib/seo/json-ld";
import { PdpHero } from "@/components/parfs/pdp/hero";
import { PdpMeet } from "@/components/parfs/pdp/meet";
import { PdpReviews } from "@/components/parfs/pdp/reviews";
import { PdpRelated } from "@/components/parfs/pdp/related";
import { SplitText } from "@/components/parfs/motion/split-text";
import type { PdpProduct, PdpSibling } from "@/components/parfs/pdp/types";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 300;

export function generateStaticParams() {
  return parfsCatalog.map((p) => ({ slug: p.slug }));
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback; // database unavailable — PARFS fragrances still render from site copy
  }
}

const siblings: PdpSibling[] = parfsProducts.map((p) => ({
  slug: p.slug,
  no: p.no,
  name: p.name,
  image: p.image,
  imageAlt: p.imageAlt,
  price: p.price,
  notes: p.notes,
  meta: p.meta,
}));

async function load(slug: string) {
  const [full, summaries] = await Promise.all([
    safe<Product | null>(() => commerce.getProduct(slug), null),
    safe<Record<string, ProductSummary>>(async () => {
      const page = await commerce.getProducts({ slugs: parfsProducts.map((p) => p.slug).concat(slug), pageSize: 12 });
      return Object.fromEntries(page.items.map((p) => [p.slug, p]));
    }, {}),
  ]);
  const parfs = parfsProducts.find((p) => p.slug === slug);
  const extra = pdpProducts[slug];
  // Collection fragrances (incl. dummy placeholders) render from the catalogue copy — USD price, notes,
  // family, gallery — and take only the live product summary from the store (so Add to bag works).
  const item = parfsCatalog.find((p) => p.slug === slug);
  if (!parfs && !full && !item) return null;
  if (!parfs && item) {
    const product: PdpProduct = {
      slug,
      no: null,
      name: item.name,
      price: `$${item.price}`,
      tagline: null,
      meta: `${item.concentration === "Extrait de Parfum" ? "Extrait" : "EDP"} — ${item.volume}`,
      notes: item.notes.split("·").map((x) => x.trim()),
      gallery: [
        { src: item.image, alt: item.imageAlt },
        { src: item.hover, alt: "" },
      ],
      details: [
        { label: "Notes", value: item.notes },
        { label: "Family", value: item.family },
        { label: "Concentration", value: item.concentration },
        { label: "Volume", value: item.volume },
      ],
      summary: summaries[slug] ?? null,
    };
    return { product, full, summaries, isParfs: true };
  }

  const details: PdpProduct["details"] = [];
  if (parfs) {
    details.push({ label: "Notes", value: parfs.notes });
    const [conc, vol] = parfs.meta.split("—").map((s) => s.trim());
    if (conc) details.push({ label: "Concentration", value: conc === "EDP" ? "Eau de Parfum" : conc === "Extrait" ? "Extrait de Parfum" : conc });
    if (vol) details.push({ label: "Volume", value: vol });
  } else if (full) {
    Object.entries(full.attributes).forEach(([label, value]) => details.push({ label, value }));
  }

  const product: PdpProduct = {
    slug,
    no: parfs?.no ?? null,
    name: parfs?.name ?? full!.name,
    price: parfs?.price ?? formatMoney(full!.price, full!.currency),
    tagline: extra?.tagline ?? full?.description ?? null,
    meta: parfs?.meta ?? null,
    notes: parfs ? parfs.notes.split("·").map((s) => s.trim()) : full?.highlights ?? [],
    gallery: extra?.gallery ?? full?.images.map((i) => ({ src: i.src, alt: i.alt })) ?? [],
    details,
    summary: summaries[slug] ?? null,
  };
  return { product, full, summaries, isParfs: !!parfs };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return { title: "Fragrance not found" };
  const { product } = data;
  const description = [product.tagline, product.notes.join(" · "), product.meta].filter(Boolean).join(" — ");
  return {
    title: { absolute: `${product.name} — PARFS` },
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} — PARFS`, description, images: product.gallery.slice(0, 1).map((g) => ({ url: g.src, alt: g.alt })) },
  };
}

/** PARFS product details page, laid out after étoile.com's product page. */
export default async function ParfsProductPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { product, full, summaries, isParfs } = data;
  const related = siblings.filter((s) => s.slug !== product.slug);

  return (
    <>
      {full && <JsonLd data={productJsonLd(full)} />}
      <PdpHero product={product} siblings={isParfs ? siblings : []} />

      <section className="bg-p-paper px-40 pt-120 pb-140 text-center text-p-text max-lg:px-[20px] max-lg:pt-[64px] max-lg:pb-[80px]">
        <SplitText as="h2" lines={pdpStatement} by="word" className="mx-auto max-w-880 font-italiana fs-56 leading-[1.1] max-lg:text-[34px]" />
      </section>

      {isParfs && <PdpMeet product={product} siblings={siblings} />}
      <PdpReviews productName={product.name} />
      <PdpRelated items={related} summaries={summaries} />
    </>
  );
}
