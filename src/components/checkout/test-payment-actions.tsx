"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function TestPaymentActions({ tran, amount, sig }: { tran: string; amount: string; sig: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const go = async (outcome: "success" | "fail" | "cancel") => {
    setBusy(outcome);
    setError(null);
    const res = await fetch("/api/payments/test", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ tran, amount, sig, outcome }),
    });
    const data = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string };
    if (data.redirectUrl) router.replace(data.redirectUrl);
    else {
      setError(data.error ?? "Something went wrong");
      setBusy(null);
    }
  };
  return (
    <div className="mt-8 flex flex-col gap-3">
      <Button fullWidth onClick={() => go("success")} loading={busy === "success"} disabled={!!busy}>
        Simulate successful payment
      </Button>
      <Button fullWidth variant="outline" onClick={() => go("fail")} loading={busy === "fail"} disabled={!!busy}>
        Simulate failed payment
      </Button>
      <Button fullWidth variant="ghost" onClick={() => go("cancel")} loading={busy === "cancel"} disabled={!!busy}>
        Cancel payment
      </Button>
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
    </div>
  );
}
