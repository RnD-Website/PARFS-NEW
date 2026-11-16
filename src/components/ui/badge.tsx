import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

/** Figma "Badge": Sale (orange) · New (ink) · AI pick (violet + sparkles). */
export function Badge({ type, label, className }: { type: "sale" | "new" | "ai-pick"; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-full px-3 text-[12px] leading-[1.4] font-bold whitespace-nowrap",
        type === "sale" && "bg-orange text-white",
        type === "new" && "bg-ink text-white",
        type === "ai-pick" && "bg-violet text-white",
        className,
      )}
    >
      {type === "ai-pick" && <Icon name="sparkles" size={12} strokeWidth={2} />}
      {label ?? (type === "new" ? "New" : type === "ai-pick" ? "AI pick" : "Sale")}
    </span>
  );
}
