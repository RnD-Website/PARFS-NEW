"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { parfsFooter } from "@/content/parfs-home";
import { SplitText } from "./motion/split-text";
import { scrollToTarget } from "./motion/smooth-scroll";

/** Figma: Footer (1440×925). */
export function ParfsFooter() {
  const { contact, subscribe, socials, legals, copyright, region } = parfsFooter;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ status: "idle" | "sending" | "done" | "error"; message?: string }>({ status: "idle" });
  const pathname = usePathname();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ status: "sending" });
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Submitting the form is the opt-in (the design has no separate consent box).
        body: JSON.stringify({ email, consent: true }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong — please try again.");
      setState({ status: "done", message: data.message ?? "Welcome to the Maison." });
      setEmail("");
    } catch (err) {
      setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
  }

  // No footer on checkout (distraction-free, like a hosted checkout).
  if (pathname === "/checkout") return null;

  const colTitle = "p-mono-sm text-white/40";
  const linkCls = "p-mono text-white p-underline";

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#3a4456] via-[#141820] via-55% to-p-ink px-40 pt-110 pb-36 text-white max-lg:px-[20px] max-lg:pt-[80px] max-lg:pb-[28px]">
      <div className="flex items-center justify-between gap-[40px] max-lg:flex-col max-lg:items-stretch">
        {/* Contact */}
        <div className="flex flex-col gap-14 max-lg:order-2 max-lg:gap-[14px]" data-reveal="fade">
          <p className={colTitle}>{contact.title}</p>
          <a href={`mailto:${contact.email}`} className={linkCls}>
            → {contact.email}
          </a>
          <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className={linkCls}>
            → {contact.phone}
          </a>
        </div>

        {/* Subscribe */}
        <div className="border border-p-gold-light/35 p-8 max-lg:order-1 max-lg:p-[8px]" data-reveal="fade" data-reveal-delay="0.1">
          <form onSubmit={onSubmit} className="flex w-500 flex-col items-center gap-18 border border-p-gold-light/35 px-44 py-40 max-lg:w-full max-lg:gap-[18px] max-lg:px-[20px] max-lg:py-[36px]">
            <h2 className="text-center font-italiana fs-32 leading-[normal] tracking-[0.06em] uppercase max-lg:text-[26px] lg:whitespace-nowrap">{subscribe.title}</h2>
            <p className="text-center p-mono-sm text-white/50">{subscribe.sub}</p>
            <label className="flex w-full items-center justify-between gap-12 border-b border-white/35 py-14 transition-colors focus-within:border-p-gold-light max-lg:py-[14px]">
              <span className="sr-only">Your email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="YOUR EMAIL"
                autoComplete="email"
                className="min-w-0 flex-1 bg-transparent p-mono text-white outline-none placeholder:text-white/45"
              />
              <button type="submit" disabled={state.status === "sending"} className="group p-mono whitespace-nowrap text-p-gold-light transition-colors hover:text-white disabled:opacity-50">
                {state.status === "sending" ? "Sending…" : "Send"} <span className="inline-block transition-transform duration-500 group-hover:translate-x-4">→</span>
              </button>
            </label>
            <p aria-live="polite" className={`min-h-[1em] p-mono-sm ${state.status === "error" ? "text-[#e9a08a]" : "text-p-gold-light"}`}>
              {state.message}
            </p>
          </form>
        </div>

        {/* Socials + legals */}
        <div className="flex gap-64 max-lg:order-3 max-lg:gap-[64px]" data-reveal="fade" data-reveal-delay="0.2">
          <div className="flex flex-col gap-14 max-lg:gap-[14px]">
            <p className={colTitle}>Socials</p>
            {socials.map((s) =>
              s.href ? (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className={linkCls}>
                  {s.label}
                </a>
              ) : (
                <span key={s.label} className="p-mono text-white">
                  {s.label}
                </span>
              ),
            )}
          </div>
          <div className="flex flex-col gap-14 max-lg:gap-[14px]">
            <p className={colTitle}>Legals</p>
            {legals.map((l) => (
              <Link key={l.label} href={l.href} className={linkCls}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Giant wordmark */}
      <SplitText
        as="p"
        lines="PARFS"
        className="mt-80 font-italiana fs-472 leading-[0.85] tracking-[10px] lg:tracking-[calc(var(--spacing)*10)] whitespace-nowrap text-p-gold-light [text-box:trim-both_cap_alphabetic] max-lg:mt-[56px] max-lg:text-[27vw]"
        stagger={0.07}
      />

      <div className="mt-80 flex items-start justify-between border-t border-white/15 pt-24 p-mono-sm max-lg:mt-[48px] max-lg:flex-col max-lg:gap-[12px] max-lg:pt-[20px]">
        <p className="text-white/50">{copyright}</p>
        <p className="text-white/50">{region}</p>
        <button type="button" onClick={() => scrollToTarget(0)} className="group text-white">
          Back to top <span className="inline-block transition-transform duration-500 group-hover:-translate-y-3">↑</span>
        </button>
      </div>
    </footer>
  );
}
