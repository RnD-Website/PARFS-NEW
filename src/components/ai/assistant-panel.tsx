"use client";

import * as D from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useUI } from "@/stores/ui";
import { useAIChat } from "./use-ai-chat";
import { ChatView } from "./chat-view";
import { Icon } from "@/components/icons/icon";

/** Slide-in GASENOS AI panel available on every page (opened by chips, search, launcher). */
export function AssistantPanel() {
  const open = useUI((s) => s.assistantOpen);
  const close = useUI((s) => s.closeAssistant);
  const prompt = useUI((s) => s.assistantPrompt);
  const consume = useUI((s) => s.consumeAssistantPrompt);
  const pathname = usePathname();
  const productSlug = pathname.startsWith("/products/") ? pathname.split("/")[2] : undefined;
  const chat = useAIChat({ productSlug });
  const { send } = chat;

  useEffect(() => {
    if (open && prompt) {
      const p = consume();
      if (p) send(p);
    }
  }, [open, prompt, consume, send]);

  if (pathname === "/assistant") return null;

  return (
    <D.Root open={open} onOpenChange={(v) => !v && close()}>
      <D.Portal>
        <D.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <D.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-white shadow-2xl outline-none data-[state=open]:animate-slide-up sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[480px] sm:rounded-[24px] sm:data-[state=open]:animate-slide-in-right"
        >
          <D.Title className="sr-only">GASENOS AI shopping assistant</D.Title>
          <ChatView
            chat={chat}
            onClose={close}
            onNavigate={close}
            headerActions={
              <Link
                href="/assistant"
                onClick={close}
                aria-label="Open full screen"
                className="hidden size-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5 sm:flex"
              >
                <Icon name="arrow-up-right" size={18} />
              </Link>
            }
          />
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
