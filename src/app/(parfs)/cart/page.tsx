import { BlankPage, blankMetadata } from "@/components/parfs/blank/blank-page";

export const metadata = blankMetadata("Bag");

/** Bag page (linked from the bag drawer's View bag) — not designed yet; intentionally blank (the old store page was archived in _archive/). */
export default function Page() {
  return <BlankPage title="Bag" />;
}
