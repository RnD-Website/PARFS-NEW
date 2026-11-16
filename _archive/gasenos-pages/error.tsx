"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main id="main" className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <h1 className="text-h2">Something went wrong</h1>
      <p className="max-w-md text-body text-ink-muted">Sorry about that — please try again. If it keeps happening, contact us{error.digest ? ` and mention code ${error.digest}` : ""}.</p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Go home
        </ButtonLink>
      </div>
    </main>
  );
}
