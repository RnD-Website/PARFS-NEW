import type { Metadata } from "next";
import { WishlistPageView } from "@/components/parfs/wishlist/wishlist-page-view";

export const metadata: Metadata = { title: { absolute: "Wishlist — PARFS" }, robots: { index: false } };

/** PARFS wishlist page. (The old GASENOS page is archived in _archive/gasenos-pages/(store)/_gasenos-wishlist.tsx.bak.) */
export default function WishlistPage() {
  return <WishlistPageView />;
}
