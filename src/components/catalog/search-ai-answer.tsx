"use client";

import { useEffect, useRef } from "react";
import { useAIChat } from "@/components/ai/use-ai-chat";
import { ChatMessage } from "@/components/ai/chat-message";
import { useUI } from "@/stores/ui";
import { Icon } from "@/components/icons/icon";

/** GASENOS AI's take on a search query, streamed above keyword results. */
export function SearchAIAnswer({ query }: { query: string }) {
  const chat = useAIChat();
  const openAssistant = useUI((s) => s.openAssistant);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    chat.send(query);
  }, [chat, query]);

  const answer = chat.messages.find((m) => m.role === "assistant");
  return (
    <section aria-label="GASENOS AI suggestions" className="rounded-[24px] border-[1.5px] border-violet/30 bg-white p-4 sm:p-5">
      {answer ? <ChatMessage message={answer} /> : <p className="text-body-sm text-ink-muted">Asking GASENOS AI…</p>}
      {answer && !answer.pending && (
        <button
          type="button"
          onClick={() => openAssistant(query)}
          className="mt-4 ml-[42px] inline-flex items-center gap-1.5 text-body-sm font-semibold text-violet hover:underline"
        >
          <Icon name="sparkles" size={14} /> Continue in chat
        </button>
      )}
    </section>
  );
}
