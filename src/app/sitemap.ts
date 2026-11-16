import type { MetadataRoute } from "next";
import { parfsCatalog } from "@/content/parfs-catalog";
import { legalPages } from "@/content/parfs-legal";

/** PARFS pages only. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const u = (p: string) => new URL(p, base).toString();
  return [
    { url: u("/"), changeFrequency: "weekly", priority: 1 },
    { url: u("/collection"), changeFrequency: "weekly", priority: 0.9 },
    ...parfsCatalog.map((p) => ({ url: u(`/products/${p.slug}`), changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: u("/contact"), priority: 0.5 },
    { url: u("/faq"), priority: 0.5 },
    ...legalPages.map((p) => ({ url: u(`/legal/${p.slug}`), priority: 0.3 })),
  ];
}
