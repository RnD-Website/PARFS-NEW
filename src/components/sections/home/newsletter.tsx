"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { newsletter } from "@/content/home";
import { newsletterSchema, type NewsletterInput } from "@/lib/marketing/schemas";
import { Input, Checkbox } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";

/** Figma "Newsletter" (hidden in the mockup, enabled per brief). */
export function Newsletter() {
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const { register, handleSubmit, formState, reset } = useForm<NewsletterInput>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { name: "", email: "", consent: false },
  });

  const onSubmit = handleSubmit(async (data) => {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    if (res.ok) {
      setState("done");
      setMessage(body.message ?? "You're on the list!");
      reset();
    } else {
      setState("error");
      setMessage(body.error ?? "Something went wrong. Please try again.");
    }
  });

  return (
    <section aria-labelledby="newsletter-title" className="bg-cream py-14 lg:py-[104px]">
      <div className="container-page flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-col items-start gap-5">
          <span className="rounded-full bg-ink px-3.5 py-2 text-caption font-semibold text-white">{newsletter.pill}</span>
          <h2 id="newsletter-title" className="font-display text-[clamp(44px,5vw+12px,72px)] leading-[0.98] font-extrabold tracking-[-0.03em]">
            {newsletter.title[0]}
            <br />
            <span className="text-orange">{newsletter.title[1]}</span>
          </h2>
          <p className="max-w-[460px] text-body text-ink-2">{newsletter.text}</p>
        </div>
        <div className="flex-1 rounded-[28px] bg-dark p-6 sm:p-8">
          {state === "done" ? (
            <div className="flex flex-col items-start gap-3 py-6 text-cream" role="status">
              <span className="flex size-12 items-center justify-center rounded-full bg-orange text-ink">
                <Icon name="check" size={24} strokeWidth={2} />
              </span>
              <p className="text-h4">{message}</p>
              <p className="text-body-sm text-dark-muted">Check your inbox for a welcome email.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[18px]">
              <p className="text-h4 text-cream">{newsletter.formTitle}</p>
              <Input tone="dark" label="Your name" placeholder="Name here" autoComplete="name" error={formState.errors.name?.message} {...register("name")} />
              <Input tone="dark" label="Email address" type="email" placeholder="you@example.com" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
              <Checkbox tone="dark" label={newsletter.consent} {...register("consent")} />
              {formState.errors.consent && <p className="text-caption text-orange-soft">{formState.errors.consent.message}</p>}
              {state === "error" && (
                <p role="alert" className="text-body-sm text-orange-soft">
                  {message}
                </p>
              )}
              <Button type="submit" variant="accent" fullWidth loading={formState.isSubmitting}>
                {newsletter.cta}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
