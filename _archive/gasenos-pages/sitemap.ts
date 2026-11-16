import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { site } from "@/content/site";
import { policies, helpTopics } from "@/content/policies";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    db.product.findMany({ where: { status: "active" }, select: { slug: true, updatedAt: true } }),
    db.category.findMany({ select: { slug: true } }),
  ]);
  const u = (p: string) => new URL(p, site.url).toString();
  const staticPages = ["/", "/shop", "/categories", "/deals", "/new", "/assistant", "/about", "/contact", "/faq", "/help", "/membership", "/track-order"];
  return [
    ...staticPages.map((p) => ({ url: u(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.7 })),
    ...categories.map((c) => ({ url: u(`/shop/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: u(`/products/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...policies.map((p) => ({ url: u(`/policies/${p.slug}`), priority: 0.3 })),
    ...helpTopics.map((t) => ({ url: u(`/help/${t.slug}`), priority: 0.3 })),
  ];
}
