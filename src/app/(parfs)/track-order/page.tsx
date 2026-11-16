import { BlankPage, blankMetadata } from "@/components/parfs/blank/blank-page";

export const metadata = blankMetadata("Track your order");

/** Order tracking (contact page order lookup) — not designed yet; intentionally blank (the old store page was archived in _archive/). */
export default function Page() {
  return <BlankPage title="Track your order" />;
}
