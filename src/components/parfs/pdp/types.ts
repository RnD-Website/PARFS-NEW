import type { ProductSummary } from "@/lib/commerce/types";
import type { PdpMedia } from "@/content/parfs-pdp";

/** Everything the PARFS product page renders, normalised from catalogue + PARFS copy. */
export type PdpProduct = {
  slug: string;
  no: string | null;
  name: string;
  price: string;
  tagline: string | null;
  meta: string | null;
  notes: string[];
  gallery: PdpMedia[];
  details: { label: string; value: string }[];
  /** Catalogue record used by the cart; null when the database is unavailable. */
  summary: ProductSummary | null;
};

export type PdpSibling = { slug: string; no: string; name: string; image: string; imageAlt: string; price: string; notes: string; meta: string };
