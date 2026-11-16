import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

export function Rating({
  average,
  count,
  variant = "compact",
  className,
}: {
  average: number;
  count?: number;
  variant?: "compact" | "reviews";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-body-sm text-ink-2", className)}>
      <Icon name="star" size={variant === "reviews" ? 20 : 14} filled className="text-orange" />
      <span>
        <span className="sr-only">Rated </span>
        {average.toFixed(1)}
        <span className="sr-only"> out of 5</span>
        {count != null && (variant === "reviews" ? ` · ${count} reviews` : ` (${count})`)}
      </span>
    </span>
  );
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5", className)} aria-label={`${value} out of 5 stars`} role="img">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" size={size} filled={i < Math.round(value)} className={i < Math.round(value) ? "" : "opacity-30"} />
      ))}
    </span>
  );
}
