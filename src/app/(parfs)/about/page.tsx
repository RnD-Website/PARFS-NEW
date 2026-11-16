import { BlankPage, blankMetadata } from "@/components/parfs/blank/blank-page";

export const metadata = blankMetadata("About");

/** About page (ingredients section link) — not designed yet; intentionally blank (the old store page was archived in _archive/). */
export default function Page() {
  return <BlankPage title="About" />;
}
