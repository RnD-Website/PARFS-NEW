"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";
import { ChatMessage, AIAvatar } from "./chat-message";
import { useVoiceInput } from "./use-voice-input";
import type { useAIChat } from "./use-ai-chat";

const STARTERS = [
  "Running shoes under ৳18,000, EU 42",
  "Best earbuds for the gym",
  "Gift for dad under ৳12,000",
  "Cosy reading corner setup",
  "How long does delivery take?",
  "Track my order",
];

/** Full chat surface (header, transcript, composer). Used by the panel and /assistant. */
export function ChatView({
  chat,
  onClose,
  onNavigate,
  className,
  headerActions,
}: {
  chat: ReturnType<typeof useAIChat>;
  onClose?: () => void;
  onNavigate?: () => void;
  className?: string;
  headerActions?: React.ReactNode;
}) {
  const { messages, busy, send, stop, reset } = chat;
  const [value, setValue] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const submit = (text: string) => {
    if (!text.trim()) return;
    send(text);
    setValue("");
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(value);
  };
  const voice = useVoiceInput((t, final) => {
    setValue(t);
    if (final) submit(t);
  });

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-white", className)}>
      <div className="flex items-center gap-2.5 px-5 pt-[18px] pb-3.5">
        <AIAvatar size={36} />
        <div className="min-w-0 flex-1">
          <p className="text-label">GASENOS AI</p>
          <p className="text-caption text-ink-muted">Shopping assistant · replies instantly</p>
        </div>
        {headerActions}
        {messages.length > 0 && (
          <button type="button" onClick={reset} className="rounded-full px-3 py-1.5 text-caption font-semibold text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink">
            New chat
          </button>
        )}
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Close GASENOS AI" className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ink/5">
            <Icon name="close" size={20} />
          </button>
        )}
      </div>
      <div className="mx-5 h-px bg-line" />

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-5 py-4" aria-live="polite" aria-busy={busy}>
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col justify-end gap-4 pb-2">
            <div className="flex items-start gap-2.5">
              <AIAvatar />
              <p className="rounded-[18px] rounded-tl-[6px] bg-card px-4 py-3 text-body-sm">
                Hi! I’m GASENOS AI. Describe what you need in plain words — budget, occasion, your size — and I’ll find matching products, compare them and add them to your cart.
              </p>
            </div>
            <div className="ml-[42px] flex flex-wrap gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-violet-soft pr-4 pl-3.5 text-body-sm transition-colors hover:bg-[#ddd6ff]"
                >
                  <Icon name="sparkles" size={14} className="text-violet" /> {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => <ChatMessage key={m.id} message={m} onSuggestion={submit} onNavigate={onNavigate} />)
        )}
      </div>

      <form onSubmit={onSubmit} className="px-5 pt-1 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="flex h-[60px] items-center gap-3 rounded-full border-[1.5px] border-violet bg-card pr-2 pl-5 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(107,78,255,0.18)]">
          <Icon name="sparkles" size={20} className="shrink-0 text-violet" />
          <label htmlFor={inputId} className="sr-only">
            Message GASENOS AI
          </label>
          <input
            id={inputId}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={messages.length ? "Ask a follow-up: “show me in black”" : "Ask GASENOS AI anything…"}
            autoComplete="off"
            enterKeyHint="send"
            maxLength={1000}
            className="h-full min-w-0 flex-1 bg-transparent text-body outline-none placeholder:text-ink-muted"
          />
          {voice.supported && (
            <button
              type="button"
              onClick={voice.toggle}
              aria-label={voice.listening ? "Stop voice input" : "Speak your question"}
              aria-pressed={voice.listening}
              className={cn("flex size-9 items-center justify-center rounded-full text-ink-2 hover:bg-violet-soft hover:text-violet", voice.listening && "animate-pulse bg-violet-soft text-violet")}
            >
              <Icon name="mic" size={20} />
            </button>
          )}
          {busy ? (
            <button type="button" onClick={stop} aria-label="Stop response" className="flex size-11 items-center justify-center rounded-full bg-ink text-white">
              <span className="size-3 rounded-[3px] bg-white" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              aria-label="Send"
              className="flex size-11 items-center justify-center rounded-full bg-violet text-white transition-[background-color,transform] hover:bg-[#5a3df0] active:scale-95 disabled:opacity-50"
            >
              <Icon name="arrow-right" size={20} />
            </button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-ink-faint">GASENOS AI only recommends products from our catalogue. Always check details before you buy.</p>
      </form>
    </div>
  );
}
