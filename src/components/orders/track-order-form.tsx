"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { trackSchema } from "@/lib/orders/schemas";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function TrackOrderForm({ defaultOrder }: { defaultOrder: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<z.input<typeof trackSchema>>({ resolver: zodResolver(trackSchema), defaultValues: { orderNumber: defaultOrder, email: "" } });
  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    const res = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
    const data = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string };
    if (!res.ok || !data.redirectUrl) return setError(data.error ?? "Order not found.");
    router.push(data.redirectUrl);
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-[24px] bg-card p-5 sm:p-6">
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
      <Input label="Order number" placeholder="GAS-XXXXXX" autoComplete="off" error={formState.errors.orderNumber?.message} {...register("orderNumber")} />
      <Input label="Email used at checkout" type="email" autoComplete="email" error={formState.errors.email?.message} {...register("email")} />
      <Button type="submit" className="self-start" arrow loading={formState.isSubmitting}>
        Track order
      </Button>
    </form>
  );
}
