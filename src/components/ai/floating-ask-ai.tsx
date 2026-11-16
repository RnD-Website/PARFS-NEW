"use client";

import { useUI } from "@/stores/ui";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

/** Figma "Ask AI Button" — fixed launcher (tablet & desktop; mobile uses the tab bar). */
export function FloatingAskAI() {
  const open = useUI((s) => s.assistantOpen);
  const openAssistant = useUI((s) => s.openAssistant);
  return (
    <button
      type="button"
      onClick={() => openAssistant()}
      aria-label="Ask GASENOS AI"
      className={cn(
        "fixed right-6 bottom-6 z-40 hidden h-14 items-center gap-2.5 rounded-full bg-violet pr-[22px] pl-2 text-button text-white shadow-[0_12px_16px_rgba(28,26,23,0.12)] transition-[transform,background-color,opacity] duration-300 hover:-translate-y-0.5 hover:bg-[#5a3df0] md:flex xl:right-8 xl:bottom-8",
        open && "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-white text-violet">
        <Icon name="sparkles" size={20} />
      </span>
      Ask GASENOS AI
    </button>
  );
}
