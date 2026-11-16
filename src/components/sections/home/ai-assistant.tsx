import Image from "next/image";
import type { ProductSummary } from "@/lib/commerce/types";
import { aiSection } from "@/content/home";
import { AISearchBar } from "@/components/ai/ai-search-bar";
import { PromptChip } from "@/components/ai/prompt-chip";
import { Icon, type IconName } from "@/components/icons/icon";
import { formatMoney } from "@/lib/utils/money";
import { AIDemoAdd, AIDemoCheckout, AIDemoFollowUp, TryAIButton } from "./ai-assistant-client";

/**
 * Figma "AI Shopping Assistant". The chat on the right is a live demo: the suggestion
 * cards are real catalogue products (add-to-cart works) and the follow-up bar opens
 * the real assistant.
 */
export function AIAssistantSection({ picks }: { picks: { product: ProductSummary; title: string; note: string; image: string; variantId: string | null; variantTitle: string | null }[] }) {
  const totalPick = picks[0];
  return (
    <section aria-labelledby="ai-title" className="container-page pb-14 lg:pb-[104px]">
      <div className="flex flex-col gap-10 overflow-hidden rounded-[28px] bg-orange px-5 pt-8 pb-5 sm:p-10 lg:flex-row lg:items-center lg:gap-20 lg:rounded-[32px] lg:pt-14 lg:pr-10 lg:pb-10 lg:pl-14">
        <div className="flex min-w-0 flex-1 flex-col gap-8">
          <div className="flex flex-col gap-[22px] text-white">
            <p className="text-eyebrow text-violet-soft">( {aiSection.eyebrow.toUpperCase()} )</p>
            <h2 id="ai-title" className="text-h1">
              {aiSection.title[0]} <br className="hidden xl:block" />
              {aiSection.title[1]}
            </h2>
            <p className="text-body-lg">{aiSection.subtext}</p>
          </div>
          <div className="flex flex-col gap-4">
            <AISearchBar mode="assistant" size="lg" placeholder={aiSection.placeholder} label="Ask GASENOS AI" />
            <div className="flex flex-wrap gap-2">
              {aiSection.prompts.map((p) => (
                <PromptChip key={p} prompt={p} tone="on-orange" />
              ))}
            </div>
          </div>
          <TryAIButton label={aiSection.cta} />
        </div>

        {/* Live chat demo */}
        <div className="flex w-full shrink-0 flex-col gap-3.5 rounded-[24px] bg-white px-4 pt-[18px] pb-5 sm:px-5 lg:w-[min(560px,45%)]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-full bg-violet text-white">
              <Icon name="sparkles" size={18} />
            </span>
            <div>
              <p className="text-label">GASENOS AI</p>
              <p className="text-caption text-ink-muted">Shopping assistant · replies instantly</p>
            </div>
          </div>
          <div className="h-px bg-line" />
          <div className="flex justify-end">
            <p className="max-w-[300px] rounded-[18px] rounded-tr-[6px] bg-ink px-4 py-3 text-body-sm text-white">{aiSection.demo.user}</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet text-white">
              <Icon name="sparkles" size={16} />
            </span>
            <p className="max-w-[340px] rounded-[18px] rounded-tl-[6px] bg-card px-4 py-3 text-body-sm">{aiSection.demo.ai}</p>
          </div>
          <div className="flex flex-col gap-2 sm:pl-[42px]">
            {picks.map((p) => (
              <div key={p.product.slug} className="relative flex items-center gap-3.5 rounded-[18px] bg-card py-3 pr-3.5 pl-3">
                <span className="relative size-[72px] shrink-0 overflow-hidden rounded-xl border border-ink/10">
                  <Image src={p.image} alt={p.product.name} fill sizes="72px" className="object-cover" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                  <a href={`/products/${p.product.slug}`} className="text-label line-clamp-2 after:absolute after:inset-0 hover:underline">
                    {p.title}
                  </a>
                  <span className="text-caption text-ink-muted">{p.note}</span>
                  <span className="text-[16px] leading-[1.2] font-bold tabular-nums">{formatMoney(p.product.price, p.product.currency)}</span>
                </span>
                <AIDemoAdd pick={p} />
              </div>
            ))}
            {totalPick && <AIDemoCheckout pick={totalPick} />}
          </div>
          <AIDemoFollowUp placeholder={aiSection.demo.followUp} />
        </div>
      </div>

      <ul className="no-scrollbar mt-10 flex snap-x gap-6 overflow-x-auto md:grid md:grid-cols-3 md:gap-8 md:overflow-visible lg:grid-cols-5">
        {aiSection.features.map((f) => (
          <li key={f.title} className="flex w-[240px] shrink-0 snap-start flex-col gap-4 md:w-auto">
            <span className="flex size-12 items-center justify-center rounded-full bg-white">
              <Icon name={f.icon as IconName} size={22} />
            </span>
            <div className="flex flex-col gap-3">
              <h3 className="text-h4">{f.title}</h3>
              <p className="text-body-sm text-ink-muted">{f.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
