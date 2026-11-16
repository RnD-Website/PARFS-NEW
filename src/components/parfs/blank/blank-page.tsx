import type { Metadata } from "next";

/**
 * Intentionally blank PARFS page — for links the PARFS site keeps (bag, checkout, account, about,
 * order tracking) whose pages haven't been designed yet. It renders inside the PARFS header/footer
 * with an empty paper area, so no old GASENOS page is ever shown.
 */
export function blankMetadata(title: string): Metadata {
  return { title: { absolute: `${title} — PARFS` }, robots: { index: false, follow: true } };
}

export function BlankPage({ title }: { title: string }) {
  return (
    <section aria-label={title} className="min-h-[80svh] bg-p-paper">
      <h1 className="sr-only">{title}</h1>
    </section>
  );
}
