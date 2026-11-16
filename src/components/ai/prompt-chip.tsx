"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";

/** Figma "AI Prompt Chip" — sends its prompt to GASENOS AI. */
export function PromptChip({
  prompt,
  tone = "soft",
  className,
  onSelect,
}: {
  prompt: string;
  tone?: "soft" | "on-orange";
  className?: string;
  onSelect?: (prompt: string) => void;
}) {
  const openAssistant = useUI((s) => s.openAssistant);
  return (
    <button
      type="button"
      onClick={() => (onSelect ? onSelect(prompt) : openAssistant(prompt))}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full pr-4 pl-3.5 text-body-sm whitespace-nowrap transition-[background-color,transform,color] duration-200 active:scale-[0.97]",
        tone === "soft" && "bg-violet-soft text-ink hover:bg-[#ddd6ff]",
        tone === "on-orange" && "bg-white/20 text-white hover:bg-white/30",
        className,
      )}
    >
      <Icon name="sparkles" size={14} strokeWidth={1.8} className={tone === "soft" ? "text-violet" : "text-violet-soft"} />
      {prompt}
    </button>
  );
}
