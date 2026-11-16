import Image from "next/image";
import Link from "next/link";
import type { AIProductPick } from "@/lib/ai/types";
import { formatMoney } from "@/lib/utils/money";
import { QuickAddButton } from "@/components/commerce/add-to-cart-button";

/** Figma "AI Suggestion Card": product the AI recommends, why it matches, one-tap add. */
export function SuggestionCard({ pick, onNavigate }: { pick: AIProductPick; onNavigate?: () => void }) {
  const { product, reason, variant } = pick;
  const img = product.images[0];
  const sizeLabel = variant?.title.split(" / ").find((x) => /^\d{2}$/.test(x));
  return (
    <div className="relative flex items-center gap-3.5 rounded-[18px] bg-card py-3 pr-3.5 pl-3 transition-colors hover:bg-muted/70">
      <div className="relative size-[72px] shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-muted">
        {img && <Image src={img.src} alt={img.alt} fill sizes="72px" className="object-cover" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <Link href={`/products/${product.slug}`} onClick={onNavigate} className="text-label line-clamp-2 after:absolute after:inset-0 hover:underline">
          {product.name}
          {sizeLabel ? ` · EU ${sizeLabel}` : ""}
        </Link>
        {reason && <p className="text-caption text-ink-muted line-clamp-2">{reason}</p>}
        <p className="text-[16px] leading-[1.2] font-bold tabular-nums">
          {formatMoney(product.price, product.currency)}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <s className="ml-2 text-caption font-medium text-ink-faint">{formatMoney(product.compareAtPrice, product.currency)}</s>
          )}
        </p>
      </div>
      <QuickAddButton product={product} variantId={variant?.id} variantTitle={variant?.title} className="relative z-10" />
    </div>
  );
}
