"use client";

import { Fragment } from "react";
import { Icon } from "@/components/icons/icon";
import type { UIMessage } from "./use-ai-chat";
import { SuggestionCard } from "./suggestion-card";

/** Renders **bold** and line breaks only — model text is never injected as HTML. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i, arr) => (
        <Fragment key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? <strong key={j}>{part.slice(2, -2)}</strong> : <Fragment key={j}>{part}</Fragment>,
          )}
          {i < arr.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  );
}

export function AIAvatar({ size = 32 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-full bg-violet text-white" style={{ width: size, height: size }}>
      <Icon name="sparkles" size={size / 2} />
    </span>
  );
}

/** Figma "AI Chat Bubble" (User / AI) plus product cards & comparison table. */
export function ChatMessage({
  message,
  onSuggestion,
  onNavigate,
}: {
  message: UIMessage;
  onSuggestion?: (s: string) => void;
  onNavigate?: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[18px] rounded-tr-[6px] bg-ink px-4 py-3 text-body-sm text-white sm:max-w-[320px]">{message.text}</p>
      </div>
    );
  }
  const empty = !message.text && !message.products?.length && !message.error;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-2.5">
        <AIAvatar />
        {empty && message.pending ? (
          <p className="flex items-center gap-2 rounded-[18px] rounded-tl-[6px] bg-card px-4 py-3 text-body-sm text-ink-muted" aria-live="polite">
            <span className="flex gap-1" aria-hidden>
              <span className="size-1.5 animate-bounce rounded-full bg-violet [animation-delay:-0.2s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-violet [animation-delay:-0.1s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-violet" />
            </span>
            {message.status ?? "Thinking…"}
          </p>
        ) : message.text ? (
          <p className="max-w-[85%] rounded-[18px] rounded-tl-[6px] bg-card px-4 py-3 text-body-sm text-ink sm:max-w-[380px]">
            <RichText text={message.text} />
          </p>
        ) : null}
      </div>
      {message.error && (
        <p role="alert" className="ml-[42px] flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-body-sm text-danger">
          <Icon name="alert" size={16} /> {message.error}
        </p>
      )}
      {message.comparison && (
        <div className="ml-[42px] overflow-x-auto rounded-[18px] bg-card">
          <table className="w-full min-w-[320px] text-left text-body-sm">
            <caption className="sr-only">Product comparison</caption>
            <thead>
              <tr className="border-b border-line">
                <th className="p-3 text-caption font-semibold text-ink-muted" scope="col">
                  <span className="sr-only">Attribute</span>
                </th>
                {message.comparison.products.map((p) => (
                  <th key={p.slug} scope="col" className="p-3 font-semibold">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {message.comparison.rows.map((r) => (
                <tr key={r.label} className="border-b border-line/60 last:border-0">
                  <th scope="row" className="p-3 text-caption font-semibold whitespace-nowrap text-ink-muted">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="p-3 align-top">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!!message.products?.length && (
        <div className="ml-[42px] flex flex-col gap-2">
          {message.products.map((p) => (
            <SuggestionCard key={p.product.id} pick={p} onNavigate={onNavigate} />
          ))}
        </div>
      )}
      {!!message.suggestions?.length && !message.pending && (
        <div className="ml-[42px] flex flex-wrap gap-2">
          {message.suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSuggestion?.(s)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-violet-soft px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-[#ddd6ff]"
            >
              <Icon name="sparkles" size={13} className="text-violet" /> {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
