"use client";

/**
 * Shopify-style dynamic checkout block under "Add to bag": a full-width "Buy with shop Pay" button
 * (square corners, Shop Pay purple) and a "More payment options" link beneath it.
 *
 * NOTE: until the store is connected to Shopify (where Shop Pay actually lives), the store's checkout
 * runs on SSLCommerz / the mock gateway, so both act as "buy now": add this scent to the bag and go
 * straight to checkout.
 */
export function ExpressPay({ onPay }: { onPay: () => void }) {
  return (
    <div className="mt-[10px] flex flex-col items-center">
      <button
        type="button"
        onClick={onPay}
        aria-label="Buy with Shop Pay"
        className="flex h-44 w-full items-center justify-center gap-[6px] bg-[#5a31f4] text-white transition-[filter] duration-300 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-p-text max-lg:h-[44px]"
      >
        <span aria-hidden className="font-sans text-[14px] leading-none font-medium tracking-[-0.01em]">
          Buy with
        </span>
        <span aria-hidden className="font-sans text-[18px] leading-none font-bold tracking-[-0.04em]">
          shop
        </span>
        <span aria-hidden className="rounded-[4px] bg-white px-[5px] py-[2px] font-sans text-[12px] leading-none font-bold tracking-[-0.02em] text-[#5a31f4]">
          Pay
        </span>
      </button>
      <button type="button" onClick={onPay} className="mt-12 p-body fs-13 text-p-grey underline underline-offset-[3px] transition-colors hover:text-p-text max-lg:mt-[10px] max-lg:text-[13px]">
        More payment options
      </button>
    </div>
  );
}
