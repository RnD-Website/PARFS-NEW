"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, type FieldValues, type Path, type UseFormSetError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotSchema, loginSchema, registerSchema, resetSchema } from "@/lib/auth/schemas";
import type { z } from "zod";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { useSession } from "@/stores/session";

function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

async function post<T extends FieldValues>(url: string, body: unknown, setError: UseFormSetError<T>) {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string>; message?: string; user?: unknown };
  if (!res.ok && data.fields) for (const [k, m] of Object.entries(data.fields)) setError(k as Path<T>, { message: m });
  return { ok: res.ok, data };
}

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-body-sm text-danger">
      <Icon name="alert" size={18} className="mt-0.5 shrink-0" /> {message}
    </p>
  );
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={show ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute top-[30px] right-2 flex size-9 items-center justify-center rounded-full text-ink-muted hover:bg-ink/5"
      >
        <Icon name={show ? "eye-off" : "eye"} size={18} />
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const refresh = useSession((s) => s.refresh);
  const [error, setErr] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<z.input<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });
  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    const { ok, data } = await post("/api/auth/login", values, setError);
    if (!ok) return setErr(data.error ?? "Sign-in failed.");
    await refresh();
    router.replace(next);
    router.refresh();
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <Input label="Email" type="email" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
      <PasswordInput label="Password" autoComplete="current-password" required error={formState.errors.password?.message} {...register("password")} />
      <Link href="/account/forgot-password" className="self-end text-body-sm font-semibold underline-offset-4 hover:underline">
        Forgot password?
      </Link>
      <Button type="submit" fullWidth loading={formState.isSubmitting}>
        Sign in
      </Button>
      <p className="text-center text-body-sm text-ink-muted">
        New to GASENOS?{" "}
        <Link href={`/account/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const refresh = useSession((s) => s.refresh);
  const [error, setErr] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<z.input<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: sp.get("email") ?? "" },
  });
  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    const { ok, data } = await post("/api/auth/register", values, setError);
    if (!ok) return setErr(data.error ?? "Couldn't create your account.");
    await refresh();
    router.replace(next);
    router.refresh();
  });
  const e = formState.errors;
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <Input label="Full name" autoComplete="name" required error={e.name?.message} {...register("name")} />
      <Input label="Email" type="email" autoComplete="email" required error={e.email?.message} {...register("email")} />
      <Input label="Mobile number (optional)" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" error={e.phone?.message} {...register("phone")} />
      <PasswordInput label="Password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number." error={e.password?.message} {...register("password")} />
      <PasswordInput label="Confirm password" autoComplete="new-password" required error={e.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting}>
        Create account
      </Button>
      <p className="text-center text-caption text-ink-muted">
        By creating an account you agree to our{" "}
        <Link href="/policies/terms" className="underline">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/policies/privacy" className="underline">
          privacy policy
        </Link>
        .
      </p>
      <p className="text-center text-body-sm text-ink-muted">
        Already have an account?{" "}
        <Link href={`/account/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-ink underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setErr] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<z.input<typeof forgotSchema>>({ resolver: zodResolver(forgotSchema) });
  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    const { ok, data } = await post("/api/auth/forgot", values, setError);
    if (!ok) return setErr(data.error ?? "Something went wrong.");
    setDone(data.message ?? "Check your inbox.");
  });
  if (done)
    return (
      <div role="status" className="flex flex-col gap-4">
        <p className="rounded-xl bg-success/10 px-4 py-3 text-body-sm text-success">{done}</p>
        <Link href="/account/login" className="text-body-sm font-semibold underline underline-offset-4">
          Back to sign in
        </Link>
      </div>
    );
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <Input label="Email" type="email" autoComplete="email" required error={formState.errors.email?.message} {...register("email")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting}>
        Send reset link
      </Button>
      <Link href="/account/login" className="text-center text-body-sm font-semibold underline-offset-4 hover:underline">
        Back to sign in
      </Link>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const refresh = useSession((s) => s.refresh);
  const [error, setErr] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState } = useForm<z.input<typeof resetSchema>>({ resolver: zodResolver(resetSchema), defaultValues: { token } });
  const onSubmit = handleSubmit(async (values) => {
    setErr(null);
    const { ok, data } = await post("/api/auth/reset", values, setError);
    if (!ok) return setErr(data.error ?? "Couldn't reset your password.");
    await refresh();
    router.replace("/account");
  });
  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <FormError message={error} />
      <input type="hidden" {...register("token")} />
      <PasswordInput label="New password" autoComplete="new-password" required hint="At least 8 characters, with a letter and a number." error={formState.errors.password?.message} {...register("password")} />
      <PasswordInput label="Confirm new password" autoComplete="new-password" required error={formState.errors.confirmPassword?.message} {...register("confirmPassword")} />
      <Button type="submit" fullWidth loading={formState.isSubmitting}>
        Set new password
      </Button>
    </form>
  );
}
