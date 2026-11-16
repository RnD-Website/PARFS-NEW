"use client";

import { useCallback, useRef, useState } from "react";
import type { AIComparison, AIEvent, AIProductPick, ChatTurn } from "@/lib/ai/types";

export type UIMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  products?: AIProductPick[];
  comparison?: AIComparison;
  suggestions?: string[];
  status?: string | null;
  error?: string;
  pending?: boolean;
};

let seq = 0;
const nid = () => `m${Date.now().toString(36)}${(++seq).toString(36)}`;

/** Streams GASENOS AI replies from /api/ai/chat (NDJSON events). */
export function useAIChat({ productSlug }: { productSlug?: string } = {}) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<UIMessage[]>([]);
  messagesRef.current = messages;

  const patch = (id: string, fn: (m: UIMessage) => UIMessage) =>
    setMessages((ms) => ms.map((m) => (m.id === id ? fn(m) : m)));

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      const userMsg: UIMessage = { id: nid(), role: "user", text: q };
      const botId = nid();
      const history: ChatTurn[] = [...messagesRef.current, userMsg]
        .filter((m) => !m.error && (m.text || m.products?.length))
        .slice(-20)
        .map((m) => ({
          role: m.role,
          text: m.text || (m.products?.length ? "(showed products)" : ""),
          productSlugs: m.products?.map((p) => p.product.slug),
        }));
      setMessages((ms) => [...ms, userMsg, { id: botId, role: "assistant", text: "", pending: true, status: null }]);
      setBusy(true);
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ turns: history, context: productSlug ? { productSlug } : undefined }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? "Something went wrong.");
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line) continue;
            const ev = JSON.parse(line) as AIEvent;
            switch (ev.type) {
              case "text":
                patch(botId, (m) => ({ ...m, text: m.text + ev.delta, status: null }));
                break;
              case "products":
                patch(botId, (m) => ({ ...m, products: [...(m.products ?? []), ...ev.items], status: null }));
                break;
              case "comparison":
                patch(botId, (m) => ({ ...m, comparison: ev.data }));
                break;
              case "suggestions":
                patch(botId, (m) => ({ ...m, suggestions: ev.items }));
                break;
              case "status":
                patch(botId, (m) => ({ ...m, status: ev.label }));
                break;
              case "error":
                patch(botId, (m) => ({ ...m, error: ev.message }));
                break;
              case "done":
                patch(botId, (m) => ({ ...m, pending: false, status: null }));
                break;
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          patch(botId, (m) => ({ ...m, error: (e as Error).message || "Something went wrong." }));
        }
      } finally {
        patch(botId, (m) => ({ ...m, pending: false, status: null }));
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, productSlug],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
  }, []);

  return { messages, busy, send, stop, reset };
}
