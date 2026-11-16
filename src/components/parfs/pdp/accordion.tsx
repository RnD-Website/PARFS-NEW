"use client";

import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Hairline accordion row (Étoile-style "Details  +"). Height animates via grid rows. */
export function PdpAccordion({ items, defaultOpen }: { items: { title: string; body: ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen ?? null);
  const base = useId();
  return (
    <div className="border-t border-p-text/15">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div key={it.title} className="border-b border-p-text/15">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between py-18 text-left p-mono text-p-text max-lg:py-[16px]"
            >
              {it.title}
              <span aria-hidden className="relative size-12 max-lg:size-[12px]">
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-current" />
                <span className={cn("absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-current transition-transform duration-500", isOpen && "rotate-90 opacity-0")} />
              </span>
            </button>
            <div id={id} className={cn("grid transition-[grid-template-rows] duration-500 ease-out-expo", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <div className="pb-20 p-body fs-15 leading-[1.6] text-p-text/80 max-lg:pb-[18px] max-lg:text-[15px]">{it.body}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
