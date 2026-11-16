import { cn } from "@/lib/utils/cn";
import { formatMoney } from "@/lib/utils/money";

export function Price({
  amount,
  compareAt,
  currency = "BDT",
  size = "md",
  className,
}: {
  amount: number;
  compareAt?: number | null;
  currency?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2 tabular-nums", className)}>
      <span
        className={cn(
          "font-bold text-ink",
          size === "sm" && "text-[15px] leading-tight",
          size === "md" && "text-price",
          size === "lg" && "text-[22px] leading-tight",
          size === "xl" && "font-display text-[clamp(28px,3vw,36px)] leading-none font-extrabold tracking-[-0.02em]",
        )}
      >
        <span className="sr-only">{onSale ? "Sale price " : "Price "}</span>
        {formatMoney(amount, currency)}
      </span>
      {onSale && (
        <s className={cn("text-ink-faint", size === "xl" ? "text-[20px] font-semibold" : "text-body-sm", size !== "xl" && size !== "lg" && "no-underline")}>
          <span className="sr-only">Original price </span>
          {formatMoney(compareAt!, currency)}
        </s>
      )}
    </span>
  );
}
