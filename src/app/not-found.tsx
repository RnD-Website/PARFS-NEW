import Link from "next/link";

/**
 * Fallback 404 outside the PARFS layout (rare — the PARFS catch-all route normally renders
 * (parfs)/not-found.tsx inside the header and footer).
 */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-[#f3eee6] px-5 text-center text-[#221f1b]">
      <p className="font-mono text-[13px] tracking-[0.12em] text-[#221f1b]/50 uppercase">[404] — PARFS</p>
      <h1 className="font-serif text-[clamp(36px,6vw,64px)] leading-none uppercase">This page has drifted away</h1>
      <Link href="/" className="mt-4 border border-[#221f1b] px-7 py-4 text-[12px] font-medium tracking-[0.08em] uppercase transition-colors hover:bg-[#221f1b] hover:text-[#f3eee6]">
        Back to home
      </Link>
    </main>
  );
}
