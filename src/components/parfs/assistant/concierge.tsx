"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAIChat, type UIMessage } from "@/components/ai/use-ai-chat";
import { useVoiceInput } from "@/components/ai/use-voice-input";
import { parfsCatalog } from "@/content/parfs-catalog";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { useAddToBag } from "../use-add-to-bag";

const STARTERS = [
  "A woody scent under $200",
  "Something fresh for summer",
  "A gift for her under $170",
  "What's the difference between EDP and extrait?",
  "How long does delivery take?",
  "Help me track my order",
];
const INTRO =
  "Good evening — I'm the PARFS Concierge. Tell me what you'd like to feel, the occasion, or the notes you love, and I'll find your signature scent. You can also speak to me.";

/**
 * PARFS Concierge — floating "Ask PARFS" button + chat panel (after the reference assistant):
 * header with avatar and close, intro message, starter prompts, streamed replies with fragrance
 * cards (Add to bag / View), comparison tables and follow-up chips, and an input with voice:
 * speak your question (browser speech recognition) and optionally have replies read aloud.
 * Talks to /api/ai/chat (built-in advisor by default, Claude when AI_PROVIDER=anthropic).
 */
export function Concierge() {
  const pathname = usePathname();
  const productSlug = pathname.startsWith("/products/") ? pathname.split("/")[2] : undefined;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [speak, setSpeak] = useState(false);
  const { messages, busy, send, stop } = useAIChat({ productSlug });
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const spoken = useRef<Set<string>>(new Set());

  const voice = useVoiceInput((text, final) => {
    setInput(text);
    if (final && text.trim()) {
      setInput("");
      send(text);
    }
  });

  const ask = (text: string) => {
    if (!text.trim() || busy) return;
    setInput("");
    send(text);
  };

  // Keep the newest message in view.
  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Focus the field on open; Escape closes.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => field.current?.focus(), 300);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Voice replies: read each finished answer aloud when enabled.
  useEffect(() => {
    if (!speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const last = messages.at(-1);
    if (!last || last.role !== "assistant" || last.pending || !last.text || spoken.current.has(last.id)) return;
    spoken.current.add(last.id);
    const u = new SpeechSynthesisUtterance(last.text);
    u.lang = "en-US";
    u.rate = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [messages, speak]);
  useEffect(() => {
    if (!speak && typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, [speak]);

  const hydrated = useHydrated();
  const canSpeak = hydrated && "speechSynthesis" in window;

  // Keep checkout distraction-free.
  if (pathname === "/checkout") return null;

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask the PARFS Concierge"
        aria-expanded={open}
        className={cn(
          "fixed right-24 bottom-24 z-[65] flex items-center gap-12 rounded-full bg-p-gold py-6 pr-22 pl-6 text-white shadow-[0_16px_40px_-12px_rgba(104,78,44,0.55)] transition-[transform,opacity] duration-500 ease-out-expo hover:-translate-y-2 max-lg:right-[16px] max-lg:bottom-[16px] max-lg:gap-[10px] max-lg:py-[5px] max-lg:pr-[18px] max-lg:pl-[5px]",
          open && "pointer-events-none translate-y-8 opacity-0",
        )}
      >
        <span className="flex size-40 items-center justify-center rounded-full bg-p-paper text-p-gold max-lg:size-[36px]">
          <Sparkle />
        </span>
        <span className="p-mono text-white">Ask PARFS</span>
      </button>

      {/* Panel */}
      <div
        role="dialog"
        aria-label="PARFS Concierge"
        aria-hidden={!open}
        data-lenis-prevent
        className={cn(
          "fixed right-24 bottom-24 z-[66] flex h-[min(760px,calc(100svh-48px))] w-[min(460px,calc(100vw-32px))] flex-col overflow-hidden rounded-[20px] bg-white text-p-text shadow-[0_30px_80px_-24px_rgba(10,10,11,0.45)] max-lg:rounded-[16px] transition-[opacity,transform,visibility] duration-500 ease-out-expo max-lg:right-[16px] max-lg:bottom-[16px] max-lg:h-[calc(100svh-32px)]",
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-16 opacity-0",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-14 border-b border-p-text/10 bg-white px-22 py-16 max-lg:gap-[12px] max-lg:px-[18px] max-lg:py-[14px]">
          <span className="flex size-44 shrink-0 items-center justify-center rounded-full bg-p-gold text-white max-lg:size-[40px]">
            <Sparkle />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-italiana fs-24 leading-none max-lg:text-[22px]">PARFS Concierge</p>
            <p className="mt-4 p-mono-sm text-p-grey max-lg:mt-[4px]">Fragrance advisor · replies instantly</p>
          </div>
          {canSpeak && (
            <button
              type="button"
              onClick={() => setSpeak((v) => !v)}
              aria-pressed={speak}
              aria-label={speak ? "Turn off spoken replies" : "Read replies aloud"}
              title={speak ? "Spoken replies on" : "Read replies aloud"}
              className={cn("flex size-36 items-center justify-center rounded-full transition-colors", speak ? "bg-p-text text-p-paper" : "text-p-text hover:bg-p-sand")}
            >
              <SpeakerIcon on={speak} />
            </button>
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="flex size-36 items-center justify-center rounded-full text-p-text transition-colors hover:bg-p-sand">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
              <path d="m1 1 12 12M13 1 1 13" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div ref={scroller} className="flex-1 overflow-y-auto px-22 py-20 max-lg:px-[18px] max-lg:py-[16px] [&>*:first-child]:mt-0">
          <Bubble role="assistant">{INTRO}</Bubble>
          {messages.length === 0 && (
            <div className="mt-14 flex flex-wrap gap-8 pl-44 max-lg:mt-[12px] max-lg:gap-[8px] max-lg:pl-[40px]">
              {STARTERS.map((s) => (
                <Chip key={s} onClick={() => ask(s)}>
                  {s}
                </Chip>
              ))}
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} m={m} onAsk={ask} onNavigate={() => setOpen(false)} last={m === messages.at(-1)} />
          ))}
        </div>

        {/* Input */}
        <div className="border-t border-p-text/10 bg-white px-22 pt-14 pb-14 max-lg:px-[18px] max-lg:pt-[12px] max-lg:pb-[12px]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="group flex items-center"
          >
            {/* Field — the PARFS button's label box */}
            <div className={cn("flex h-48 min-w-0 flex-1 items-center gap-10 border bg-white pr-6 pl-14 transition-colors max-lg:h-[48px] max-lg:gap-[8px] max-lg:pl-[12px]", voice.listening ? "border-p-gold" : "border-p-text/30 focus-within:border-p-text")}>
              <span className="shrink-0 text-p-gold">
                <Sparkle />
              </span>
              <input
                ref={field}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={voice.listening ? "Listening…" : "Ask the Concierge anything…"}
                aria-label="Message the PARFS Concierge"
                className="min-w-0 flex-1 bg-transparent p-body fs-15 text-p-text outline-none placeholder:text-p-grey max-lg:text-[16px]"
              />
              {voice.supported && (
                <button
                  type="button"
                  onClick={voice.toggle}
                  aria-pressed={voice.listening}
                  aria-label={voice.listening ? "Stop listening" : "Speak your question"}
                  className={cn("relative flex size-36 shrink-0 items-center justify-center rounded-full transition-colors max-lg:size-[34px]", voice.listening ? "bg-p-gold text-white" : "text-p-text hover:bg-p-sand")}
                >
                  {voice.listening && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-p-gold/40" />}
                  <MicIcon />
                </button>
              )}
            </div>
            {/* Send / stop — the PARFS button's arrow circle */}
            {busy ? (
              <button type="button" onClick={stop} aria-label="Stop" className="flex size-48 shrink-0 items-center justify-center rounded-full border border-p-text bg-p-text text-p-paper max-lg:size-[48px]">
                <span className="size-10 bg-current max-lg:size-[10px]" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send"
                className="group/send relative flex size-48 shrink-0 items-center justify-center overflow-hidden rounded-full border border-p-text bg-p-text text-p-paper transition-[background-color,opacity] duration-500 hover:bg-black disabled:cursor-not-allowed disabled:opacity-80 max-lg:size-[48px]"
              >
                <ArrowIcon className="transition-transform duration-500 ease-out-expo group-hover/send:translate-x-[300%]" />
                <ArrowIcon className="absolute -translate-x-[300%] transition-transform duration-500 ease-out-expo group-hover/send:translate-x-0" />
              </button>
            )}
          </form>
          <p className="mt-8 text-center p-body fs-11 text-p-grey max-lg:mt-[8px] max-lg:text-[11px]">The Concierge only recommends fragrances from the PARFS collection.</p>
        </div>
      </div>
    </>
  );
}

function Message({ m, onAsk, onNavigate, last }: { m: UIMessage; onAsk: (t: string) => void; onNavigate: () => void; last: boolean }) {
  const addToBag = useAddToBag();
  if (m.role === "user") return <Bubble role="user">{m.text}</Bubble>;
  return (
    <div>
      {(m.text || m.pending) && (
        <Bubble role="assistant">
          {m.text || (
            <span className="inline-flex items-center gap-6 text-p-grey">
              <Dots /> {m.status ?? "Thinking…"}
            </span>
          )}
        </Bubble>
      )}
      {m.error && <p className="mt-8 pl-44 p-body fs-13 text-[#a2452f] max-lg:pl-[40px]">{m.error}</p>}
      {!!m.products?.length && (
        <ul className="mt-12 flex flex-col gap-8 pl-44 max-lg:mt-[10px] max-lg:gap-[8px] max-lg:pl-[40px]">
          {m.products.map(({ product, reason }) => {
            const info = parfsCatalog.find((c) => c.slug === product.slug);
            return (
              <li key={product.slug} className="flex gap-12 border border-p-text/10 bg-white p-8 transition-colors hover:border-p-text/25 max-lg:gap-[10px] max-lg:p-[8px]">
                <Link href={`/products/${product.slug}`} onClick={onNavigate} className="relative aspect-[4/5] w-64 shrink-0 overflow-hidden bg-p-sand max-lg:w-[60px]">
                  <Image src={info?.image ?? product.images[0]?.src ?? ""} alt={product.name} fill sizes="70px" className="object-cover" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-8">
                    <Link href={`/products/${product.slug}`} onClick={onNavigate} className="font-italiana fs-20 leading-[1.1] max-lg:text-[18px]">
                      {product.name}
                    </Link>
                    {info && <span className="shrink-0 p-body fs-14 max-lg:text-[14px]">${info.price}</span>}
                  </div>
                  {reason && <p className="mt-2 truncate p-body fs-12 text-p-text/65 max-lg:text-[12px]">{reason}</p>}
                  <div className="mt-auto flex items-center gap-14 pt-6 max-lg:gap-[12px]">
                    <button type="button" onClick={() => addToBag(product)} className="p-mono-sm text-p-text underline underline-offset-4 hover:text-p-gold">
                      Add to bag
                    </button>
                    <Link href={`/products/${product.slug}`} onClick={onNavigate} className="p-mono-sm text-p-grey hover:text-p-text">
                      View →
                    </Link>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {m.comparison && (
        <div className="mt-12 ml-44 overflow-x-auto border border-p-text/12 max-lg:ml-[40px]">
          <table className="w-full p-body fs-12 max-lg:text-[12px]">
            <thead>
              <tr className="bg-p-sand">
                <th className="p-8 text-left p-mono-sm text-p-grey" />
                {m.comparison.products.map((p) => (
                  <th key={p.slug} className="p-8 text-left font-italiana fs-16 font-normal">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {m.comparison.rows.map((r) => (
                <tr key={r.label} className="border-t border-p-text/10">
                  <td className="p-8 p-mono-sm whitespace-nowrap text-p-grey">{r.label}</td>
                  {r.values.map((v, i) => (
                    <td key={i} className="p-8 align-top">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {last && !m.pending && !!m.suggestions?.length && (
        <div className="mt-12 flex flex-wrap gap-8 pl-44 max-lg:mt-[10px] max-lg:gap-[8px] max-lg:pl-[40px]">
          {m.suggestions.map((s) => (
            <Chip key={s} onClick={() => onAsk(s)}>
              {s}
            </Chip>
          ))}
        </div>
      )}
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="mt-20 flex justify-end max-lg:mt-[18px]">
        <p className="max-w-[85%] rounded-[16px] bg-p-text px-14 py-10 p-body fs-15 leading-[1.5] text-p-paper max-lg:text-[15px]">{children}</p>
      </div>
    );
  }
  return (
    <div className="mt-24 flex gap-10 max-lg:mt-[20px] max-lg:gap-[8px]">
      <span className="flex size-34 shrink-0 items-center justify-center rounded-full bg-p-gold text-white max-lg:size-[32px]">
        <Sparkle small />
      </span>
      <div className="max-w-[85%] rounded-[16px] bg-p-sand px-14 py-10 p-body fs-15 leading-[1.55] whitespace-pre-line text-p-text max-lg:text-[15px]">{children}</div>
    </div>
  );
}

function Chip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center gap-6 rounded-full border border-p-gold/40 bg-p-gold/10 px-12 py-7 text-left p-body fs-13 text-p-text transition-colors hover:border-p-gold hover:bg-p-gold/20 max-lg:text-[13px]">
      <span className="text-p-gold">
        <Sparkle small />
      </span>
      {children}
    </button>
  );
}

/** Filled four-point sparkles (the Concierge mark). */
function Sparkle({ small }: { small?: boolean }) {
  const s = small ? 13 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M14 2.5c.65 3.9 2.6 5.85 6.5 6.5-3.9.65-5.85 2.6-6.5 6.5-.65-3.9-2.6-5.85-6.5-6.5 3.9-.65 5.85-2.6 6.5-6.5Z" />
      <path d="M6 13.5c.38 2.05 1.2 2.87 3.25 3.25C7.2 17.13 6.38 17.95 6 20c-.38-2.05-1.2-2.87-3.25-3.25C4.8 16.37 5.62 15.55 6 13.5Z" />
    </svg>
  );
}
/** The PARFS button arrow (icon/arrow-right from the Figma set), drawn in currentColor. */
function ArrowIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("block size-18 bg-current max-lg:size-[18px]", className)}
      style={{ mask: "url(/images/parfs/icon-arrow-right.svg) center / contain no-repeat", WebkitMask: "url(/images/parfs/icon-arrow-right.svg) center / contain no-repeat" }}
    />
  );
}
function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className="relative">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
    </svg>
  );
}
function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {on ? <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /> : <path d="m16 9.5 5 5m0-5-5 5" />}
    </svg>
  );
}
function Dots() {
  return (
    <span className="inline-flex gap-[3px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className="size-[5px] animate-bounce rounded-full bg-p-gold" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </span>
  );
}
