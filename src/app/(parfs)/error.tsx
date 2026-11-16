"use client";

import { useEffect } from "react";
import { ParfsButton } from "@/components/parfs/ui/parfs-button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[80svh] flex-col items-center justify-center bg-p-paper px-40 pt-120 pb-120 text-center text-p-text max-lg:px-[20px] max-lg:pt-[100px] max-lg:pb-[80px]">
      <p className="p-mono text-p-grey">[Error]</p>
      <h1 className="mt-16 font-italiana fs-64 leading-[1] uppercase max-lg:text-[40px]">Something went wrong</h1>
      <p className="mt-20 max-w-480 p-body fs-17 leading-[1.55] text-p-text/75 max-lg:text-[16px]">
        Please try again. If it keeps happening, contact us{error.digest ? ` and mention code ${error.digest}` : ""}.
      </p>
      <div className="mt-36 flex flex-wrap justify-center gap-16 max-lg:mt-[28px]">
        <ParfsButton theme="dark" solid onClick={reset}>
          Try again
        </ParfsButton>
        <ParfsButton theme="dark" href="/">
          Back to home
        </ParfsButton>
      </div>
    </section>
  );
}
