"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactInput } from "@/lib/marketing/schemas";
import { Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { useSession } from "@/stores/session";

export function ContactForm() {
  const order = useSearchParams().get("order");
  const user = useSession((s) => s.user);
  const [state, setState] = useState<"idle" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    values: { name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", subject: order ? `Help with order ${order}` : "", message: "" },
    resetOptions: { keepDirtyValues: true },
  });
  const onSubmit = handleSubmit(async (v) => {
    setError(null);
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(v) });
    const d = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) return setError(d.error ?? "Couldn't send your message.");
    setState("done");
  });
  if (state === "done")
    return (
      <div role="status" className="flex flex-col items-start gap-3 rounded-[24px] bg-card p-6">
        <span className="flex size-12 items-center justify-center rounded-full bg-success text-white">
          <Icon name="check" size={24} strokeWidth={2} />
        </span>
        <p className="text-h4">Message sent</p>
        <p className="text-body text-ink-muted">Thanks — we’ll reply by email as soon as we can.</p>
      </div>
    );
  const e = formState.errors;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4 rounded-[24px] bg-card p-5 sm:p-6">
      {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Name" autoComplete="name" required error={e.name?.message} {...register("name")} />
        <Input label="Email" type="email" autoComplete="email" required error={e.email?.message} {...register("email")} />
        <Input label="Mobile (optional)" type="tel" autoComplete="tel" error={e.phone?.message} {...register("phone")} />
        <Input label="Subject" required error={e.subject?.message} {...register("subject")} />
      </div>
      <Textarea label="Message" required error={e.message?.message} {...register("message")} />
      <Button type="submit" className="self-start" arrow loading={formState.isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
