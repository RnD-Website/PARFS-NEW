"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";
import { useVoiceInput } from "./use-voice-input";

/**
 * Figma "AI Search Bar". Natural-language search powered by GASENOS AI.
 * - mode "search": goes to /search (keyword results + AI answer)
 * - mode "assistant": opens the assistant panel with the prompt
 */
export function AISearchBar({
  placeholder = "Ask AI or search products…",
  mode = "search",
  size = "md",
  defaultValue = "",
  autoFocus,
  className,
  onSubmitted,
  label = "Search products or ask GASENOS AI",
}: {
  placeholder?: string;
  mode?: "search" | "assistant";
  size?: "md" | "lg";
  defaultValue?: string;
  autoFocus?: boolean;
  className?: string;
  onSubmitted?: () => void;
  label?: string;
}) {
  const router = useRouter();
  const openAssistant = useUI((s) => s.openAssistant);
  const [value, setValue] = useState(defaultValue);
  const id = useId();

  const submit = (text: string) => {
    const q = text.trim();
    if (!q) return;
    if (mode === "assistant") {
      openAssistant(q);
      setValue("");
    } else {
      router.push(`/search?q=${encodeURIComponent(q)}`);
    }
    onSubmitted?.();
  };

  const voice = useVoiceInput((text, final) => {
    setValue(text);
    if (final) submit(text);
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(value);
  };

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className={cn(
        "group flex w-full items-center gap-3 rounded-full border-[1.5px] border-violet bg-white pl-5 transition-shadow duration-200 focus-within:shadow-[0_0_0_4px_rgba(107,78,255,0.18)]",
        size === "md" ? "h-[52px] pr-[2px]" : "h-[60px] pr-2",
        className,
      )}
    >
      <Icon name="sparkles" size={20} className="shrink-0 text-violet" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="search"
        className="h-full min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:truncate placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {voice.supported && (
        <button
          type="button"
          onClick={voice.toggle}
          aria-label={voice.listening ? "Stop voice input" : "Search by voice"}
          aria-pressed={voice.listening}
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors hover:bg-violet-soft hover:text-violet",
            voice.listening && "animate-pulse bg-violet-soft text-violet",
          )}
        >
          <Icon name="mic" size={20} />
        </button>
      )}
      <button
        type="submit"
        aria-label={mode === "assistant" ? "Ask GASENOS AI" : "Search"}
        className="flex size-11 shrink-0 items-center justify-center rounded-full bg-violet text-white transition-[background-color,transform] duration-200 hover:bg-[#5a3df0] active:scale-95"
      >
        <Icon name="arrow-right" size={20} />
      </button>
    </form>
  );
}
