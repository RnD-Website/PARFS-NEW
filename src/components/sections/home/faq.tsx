import { faqs } from "@/content/faq";
import { Accordion } from "@/components/ui/accordion";
import { Eyebrow } from "@/components/ui/eyebrow";

export function FAQSection({ compactTop }: { compactTop?: boolean }) {
  return (
    <section aria-labelledby="faq-title" className={compactTop ? "pb-14 lg:pb-[120px]" : "py-14 lg:py-[120px]"}>
      <div className="container-page">
        <div className="mx-auto flex max-w-[731px] flex-col items-center gap-4 text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="faq-title" className="text-h1">
            Frequently asked <span className="text-orange">questions</span>
          </h2>
          <p className="text-body text-ink-2">Everything about ordering, delivery and returns. Still stuck? Ask GASENOS AI or contact us.</p>
        </div>
        <Accordion
          className="mx-auto mt-10 max-w-[840px] lg:mt-[50px]"
          defaultOpen={faqs[0].id}
          items={faqs.map((f) => ({ id: f.id, question: f.question, answer: f.answer }))}
        />
      </div>
    </section>
  );
}
