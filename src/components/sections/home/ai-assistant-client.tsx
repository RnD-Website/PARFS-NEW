"use client";

import { useRouter } from "next/navigation";
import type { ProductSummary } from "@/lib/commerce/types";
import { Button } from "@/components/ui/button";
import { QuickAddButton } from "@/components/commerce/add-to-cart-button";
import { Icon } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";
import { useCart } from "@/stores/cart";
import { formatMoney } from "@/lib/utils/money";
import { storePolicy } from "@/content/site";

type Pick = { product: ProductSummary; title: string; variantId: string | null; variantTitle: string | null };

export function TryAIButton({ label }: { label: string }) {
  const open = useUI((s) => s.openAssistant);
  return (
    <Button variant="ai" arrow onClick={() => open()} className="self-start">
      {label}
    </Button>
  );
}

export function AIDemoAdd({ pick }: { pick: Pick }) {
  return <QuickAddButton product={pick.product} variantId={pick.variantId} variantTitle={pick.variantTitle} className="relative z-10" />;
}

/** "Pick 1 · ready to buy" — adds the first pick and goes straight to checkout. */
export function AIDemoCheckout({ pick }: { pick: Pick }) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const { product } = pick;
  const free = product.price >= storePolicy.freeShippingThreshold;
  return (
    <div className="flex flex-col items-stretch justify-between gap-3 rounded-[24px] bg-card py-2 pr-2 pl-4 sm:flex-row sm:items-center sm:rounded-full">
      <div className="pt-1 sm:pt-0">
        <p className="text-caption text-ink-muted">Pick 1 · ready to buy</p>
        <p className="text-label tabular-nums">
          {formatMoney(product.price, product.currency)}
          {free ? " · free delivery" : ""}
        </p>
      </div>
      <Button
        arrow
        onClick={() => {
          const vid = pick.variantId ?? product.defaultVariantId;
          if (!vid) return router.push(`/products/${product.slug}`);
          add({
            id: vid,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0]?.src ?? null,
            variantTitle: pick.variantTitle,
            unitPrice: product.price,
            compareAtPrice: product.compareAtPrice,
            currency: product.currency,
            maxQuantity: 10,
          });
          router.push("/checkout");
        }}
      >
        Add to cart & checkout
      </Button>
    </div>
  );
}

export function AIDemoFollowUp({ placeholder }: { placeholder: string }) {
  const open = useUI((s) => s.openAssistant);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const v = new FormData(e.currentTarget).get("q")?.toString().trim();
        open(v ? `Running shoes under ৳18,000 for daily 5K runs, EU 42. ${v}` : undefined);
        e.currentTarget.reset();
      }}
      className="flex h-[60px] items-center gap-3 rounded-full border-[1.5px] border-violet bg-card pr-2 pl-5 focus-within:shadow-[0_0_0_4px_rgba(107,78,255,0.18)]"
    >
      <Icon name="sparkles" size={20} className="shrink-0 text-violet" />
      <label htmlFor="ai-demo-followup" className="sr-only">
        Ask a follow-up
      </label>
      <input id="ai-demo-followup" name="q" placeholder={placeholder} autoComplete="off" className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:truncate placeholder:text-ink-muted" />
      <button type="submit" aria-label="Ask GASENOS AI" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet text-white hover:bg-[#5a3df0]">
        <Icon name="arrow-right" size={20} />
      </button>
    </form>
  );
}

