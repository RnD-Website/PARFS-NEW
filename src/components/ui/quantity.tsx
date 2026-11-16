"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

export function QuantityStepper({
  value,
  min = 1,
  max = 10,
  onChange,
  size = "md",
  label = "Quantity",
  className,
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const btn = cn(
    "flex items-center justify-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-30 disabled:hover:bg-transparent",
    size === "sm" ? "size-8" : "size-10",
  );
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-full border-[1.5px] border-line bg-white p-0.5", className)}
    >
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Icon name="minus" size={16} strokeWidth={2} />
      </button>
      <span className={cn("text-center font-semibold tabular-nums", size === "sm" ? "w-7 text-[14px]" : "w-9")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Icon name="add" size={16} strokeWidth={2} />
      </button>
    </div>
  );
}
