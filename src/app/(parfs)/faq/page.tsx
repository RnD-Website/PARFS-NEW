import type { Metadata } from "next";
import { FaqView } from "@/components/parfs/faq/faq-view";
import { faqPage, faqTopics } from "@/content/parfs-faq";
import { JsonLd } from "@/lib/seo/json-ld";

export const metadata: Metadata = {
  title: { absolute: "FAQ — PARFS" },
  description: faqPage.intro,
  alternates: { canonical: "/faq" },
};

/** PARFS FAQ page, after jomalone.com's FAQ. (The old GASENOS page is archived in _archive/gasenos-pages/(store)/_gasenos-faq.tsx.bak.) */
export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqTopics.flatMap((t) =>
            t.items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a.join(" ") } })),
          ),
        }}
      />
      <FaqView />
    </>
  );
}
