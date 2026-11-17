import type { Metadata } from "next";
import { BagPageView } from "@/components/parfs/bag/bag-page-view";

export const metadata: Metadata = { title: { absolute: "Bag — PARFS" }, robots: { index: false } };

/** PARFS bag page — the full-page bag, linked from the bag drawer's "View bag". */
export default function Page() {
  return <BagPageView />;
}
