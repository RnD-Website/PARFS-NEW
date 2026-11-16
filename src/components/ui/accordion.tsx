"use client";

import * as A from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";

/** Figma "FAQ Item" (Closed / Open). */
export function Accordion({
  items,
  defaultOpen,
  className,
}: {
  items: { id: string; question: string; answer: React.ReactNode }[];
  defaultOpen?: string;
  className?: string;
}) {
  return (
    <A.Root type="single" collapsible defaultValue={defaultOpen} className={cn("flex flex-col gap-3.5", className)}>
      {items.map((item) => (
        <A.Item
          key={item.id}
          value={item.id}
          className="group rounded-2xl border border-line bg-card transition-colors duration-200 hover:border-ink/40 data-[state=open]:border-dark"
        >
          <A.Header asChild>
            <h3>
              <A.Trigger className="flex w-full items-center gap-4 py-4 pr-4 pl-5 text-left">
                <span className="text-h4 flex-1">{item.question}</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors group-hover:bg-ink/5">
                  <Icon name="add" size={16} strokeWidth={2} className="group-data-[state=open]:hidden" />
                  <Icon name="minus" size={16} strokeWidth={2} className="hidden group-data-[state=open]:block" />
                </span>
              </A.Trigger>
            </h3>
          </A.Header>
          <A.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_0.2s_ease-out] data-[state=open]:animate-[accordion-down_0.25s_ease-out]">
            <div className="text-body-sm pr-5 pb-5 pl-5 sm:pr-16">{item.answer}</div>
          </A.Content>
        </A.Item>
      ))}
    </A.Root>
  );
}
