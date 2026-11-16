import { site } from "@/content/site";
import { faqs } from "@/content/faq";
import type { Product } from "@/lib/commerce/types";
import { toMajor } from "@/lib/utils/money";

/** Renders schema.org JSON-LD. Content is serialised with < escaped to prevent script injection. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: site.name,
  url: site.url,
  description: site.description,
});

export const faqJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
});

export const productJsonLd = (p: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  image: p.images.map((i) => new URL(i.src, site.url).toString()),
  description: p.description ?? p.highlights.join(". ") ?? undefined,
  sku: p.variants[0]?.sku,
  brand: { "@type": "Brand", name: site.name },
  category: p.categories[0]?.name,
  ...(p.rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating.average, reviewCount: p.rating.count } } : {}),
  offers: {
    "@type": "Offer",
    url: new URL(`/products/${p.slug}`, site.url).toString(),
    priceCurrency: p.currency,
    price: toMajor(p.price).toFixed(2),
    availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  },
});

export const breadcrumbJsonLd = (items: { name: string; href: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: new URL(it.href, site.url).toString() })),
});
