"use client";

import * as D from "@radix-ui/react-dialog";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUI } from "@/stores/ui";
import { AISearchBar } from "@/components/ai/ai-search-bar";
import { PromptChip } from "@/components/ai/prompt-chip";
import { IconButton } from "@/components/ui/icon-button";
import { searchPrompts } from "@/content/home";

/** Full-width search sheet for tablet & mobile. */
export function SearchOverlay() {
  const open = useUI((s) => s.searchOpen);
  const setOpen = useUI((s) => s.setSearchOpen);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <D.Root open={open} onOpenChange={setOpen}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <D.Content className="fixed inset-x-0 top-0 z-50 rounded-b-[28px] bg-cream px-4 pt-4 pb-6 shadow-2xl outline-none data-[state=open]:animate-fade-in sm:px-8">
          <div className="mx-auto flex max-w-2xl flex-col gap-4">
            <div className="flex items-center justify-between">
              <D.Title className="text-h4">Search or ask GASENOS AI</D.Title>
              <D.Description className="sr-only">Type a product name or describe what you need.</D.Description>
              <D.Close asChild>
                <IconButton icon="close" label="Close search" variant="ghost" />
              </D.Close>
            </div>
            <AISearchBar autoFocus size="lg" onSubmitted={() => setOpen(false)} />
            <div className="flex flex-wrap gap-2">
              {searchPrompts.map((p) => (
                <PromptChip key={p} prompt={p} />
              ))}
            </div>
          </div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
