import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const P = "/images/parfs/payment";

/**
 * Accepted payment methods — Figma "Frame 1618873526" (node 40000040:8886): Visa, Amex, Mastercard,
 * Stripe and PayPal, each 35×24 with 8px between. Mastercard and PayPal are marks on a white tile
 * with a #D9D9D9 border, exactly as in the design.
 */
export function PaymentLogos({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-[8px]", className)} aria-label="Visa, American Express, Mastercard, Stripe, PayPal" role="img">
      <Logo src={`${P}/visa.svg`} />
      <Logo src={`${P}/amex.svg`} />
      <Tile src={`${P}/mastercard-mark.svg`} inset="inset-[20.83%_17.14%_21.64%_18.57%]" />
      <Logo src={`${P}/stripe.svg`} />
      <Tile src={`${P}/paypal-mark.svg`} inset="inset-[13.14%_21.43%_14.29%_21.43%]" />
    </span>
  );
}

function Logo({ src }: { src: string }) {
  return (
    <span className="relative block h-[24px] w-[35px] shrink-0">
      <Image src={src} alt="" fill unoptimized sizes="35px" className="object-fill" />
    </span>
  );
}

function Tile({ src, inset }: { src: string; inset: string }) {
  return (
    <span className="relative block h-[24px] w-[35px] shrink-0 border border-solid border-[#d9d9d9] bg-white">
      <span className={cn("absolute", inset)}>
        <Image src={src} alt="" fill unoptimized sizes="25px" className="object-fill" />
      </span>
    </span>
  );
}
