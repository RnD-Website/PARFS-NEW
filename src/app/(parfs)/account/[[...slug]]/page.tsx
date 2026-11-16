import { BlankPage, blankMetadata } from "@/components/parfs/blank/blank-page";

export const metadata = blankMetadata("Account");

/** Account pages (header account icon) — not designed yet; intentionally blank (the old store page was archived in _archive/). */
export default function Page() {
  return <BlankPage title="Account" />;
}
