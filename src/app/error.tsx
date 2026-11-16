"use client";

import { useEffect } from "react";

/** Fallback error page outside the PARFS layout ((parfs)/error.tsx handles errors on PARFS pages). */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#f3eee6] px-5 text-center text-[#221f1b]">
      <p className="font-mono text-[13px] tracking-[0.12em] text-[#221f1b]/50 uppercase">[Error] — PARFS</p>
      <h1 className="font-serif text-[clamp(32px,5vw,56px)] leading-none uppercase">Something went wrong</h1>
      <p className="max-w-md text-[16px] text-[#221f1b]/70">Please try again{error.digest ? ` (code ${error.digest})` : ""}.</p>
      <button type="button" onClick={reset} className="mt-2 border border-[#221f1b] px-7 py-4 text-[12px] font-medium tracking-[0.08em] uppercase transition-colors hover:bg-[#221f1b] hover:text-[#f3eee6]">
        Try again
      </button>
    </main>
  );
}
