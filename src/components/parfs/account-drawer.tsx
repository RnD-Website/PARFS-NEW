"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useParfsUI } from "@/stores/parfs-ui";
import { useSession } from "@/stores/session";
import { setScrollLocked } from "./motion/smooth-scroll";
import { ParfsButton } from "./ui/parfs-button";

type Step = "email" | "password" | "register";
const EMAIL = /^\S+@\S+\.\S+$/;

const label = "p-mono-sm text-p-grey";
const field =
  "mt-6 block w-full border-0 border-b border-p-text/25 bg-transparent px-0 py-10 p-body fs-16 text-p-text outline-none transition-colors placeholder:text-p-grey/60 focus:border-p-text max-lg:mt-[6px] max-lg:py-[10px] max-lg:text-[16px]";
const primary = "mt-0 w-full disabled:pointer-events-none disabled:opacity-35 [&>span:first-child]:flex-1 [&>span:first-child]:justify-center";

/**
 * PARFS sign-in drawer — after the reference: slides in from the right with "Close ✕", a serif
 * "Sign in or create an account" title, an email field, the consent line and a Sign in button that
 * wakes up once the email is valid. Then: password (existing customers) or name + password (new
 * account). Signed in, it greets the customer and offers Sign out. Uses the store's /api/auth/* routes.
 */
export function AccountDrawer() {
  const open = useParfsUI((s) => s.accountOpen);
  const setOpen = useParfsUI((s) => s.setAccountOpen);
  const user = useSession((s) => s.user);
  const setUser = useSession((s) => s.setUser);

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const firstInput = useRef<HTMLInputElement>(null);

  const close = () => setOpen(false);

  // Lock the page while open; Escape closes.
  useEffect(() => {
    if (!open) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => firstInput.current?.focus(), 350);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      setScrollLocked(false);
    };
  }, [open, setOpen, step]);

  const go = (s: Step) => {
    setError(null);
    setFieldErrors({});
    setPassword("");
    setConfirm("");
    setShow(false);
    setStep(s);
  };

  async function post(url: string, body: object) {
    setBusy(true);
    setError(null);
    setFieldErrors({});
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { user?: { id: string; name: string; email: string; phone: string | null }; error?: string; fields?: Record<string, string> } | undefined;
    setBusy(false);
    return { ok: !!res?.ok, status: res?.status ?? 0, data: data ?? {} };
  }

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    const r = await post("/api/auth/login", { email, password });
    if (r.ok && r.data.user) {
      setUser(r.data.user);
      go("email");
      return;
    }
    setError(r.status === 401 ? "Email or password is incorrect." : (r.data.error ?? "Something went wrong — please try again."));
  }

  async function onRegister(e: React.FormEvent) {
    e.preventDefault();
    const name = `${firstName.trim()} ${lastName.trim()}`.trim();
    const r = await post("/api/auth/register", { name, email, password, confirmPassword: confirm, phone: "" });
    if (r.ok && r.data.user) {
      setUser(r.data.user);
      go("email");
      return;
    }
    setFieldErrors(r.data.fields ?? {});
    setError(r.data.error ?? "Something went wrong — please try again.");
  }

  async function onSignOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).catch(() => null);
    setBusy(false);
    setUser(null);
    go("email");
  }

  const tab = open ? 0 : -1;
  const err = (k: string) => (fieldErrors[k] ? <span className="mt-6 block p-body fs-13 text-[#a2452f] max-lg:mt-[6px] max-lg:text-[13px]">{fieldErrors[k]}</span> : null);
  const consent = (
    <p className="mt-14 p-body fs-13 leading-[1.5] text-p-grey max-lg:mt-[12px] max-lg:text-[13px]">
      By continuing, you agree to our{" "}
      <Link href="/legal/privacy" onClick={close} tabIndex={tab} className="text-p-text underline underline-offset-[3px] hover:text-p-gold">
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link href="/legal/terms" onClick={close} tabIndex={tab} className="text-p-text underline underline-offset-[3px] hover:text-p-gold">
        Terms of Sale
      </Link>
      .
    </p>
  );
  const emailRow = (
    <p className="mt-28 flex items-baseline justify-between gap-12 border-b border-p-text/12 pb-12 max-lg:mt-[24px] max-lg:pb-[10px]">
      <span className="min-w-0 truncate p-body fs-15 max-lg:text-[15px]">{email}</span>
      <button type="button" onClick={() => go("email")} tabIndex={tab} className="shrink-0 p-mono-sm text-p-grey underline underline-offset-4 hover:text-p-text">
        Change
      </button>
    </p>
  );
  const passwordInput = (id: string, value: string, set: (v: string) => void, autoComplete: string, ref?: React.Ref<HTMLInputElement>) => (
    <span className="relative block">
      <input ref={ref} id={id} type={show ? "text" : "password"} required value={value} onChange={(e) => set(e.target.value)} autoComplete={autoComplete} tabIndex={tab} className={cn(field, "pr-56")} />
      <button type="button" onClick={() => setShow((v) => !v)} tabIndex={tab} className="absolute right-0 bottom-10 p-mono-sm text-p-grey hover:text-p-text max-lg:bottom-[10px]" aria-label={show ? "Hide password" : "Show password"}>
        {show ? "Hide" : "Show"}
      </button>
    </span>
  );

  return (
    <div className={cn("fixed inset-0 z-[70] transition-[visibility] duration-700", open ? "visible" : "invisible")} aria-hidden={!open}>
      <div onClick={close} className={cn("absolute inset-0 bg-p-ink/45 backdrop-blur-[2px] transition-opacity duration-500", open ? "opacity-100" : "opacity-0")} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        data-lenis-prevent
        className={cn(
          "absolute inset-y-0 right-0 flex w-480 max-w-full flex-col overflow-y-auto bg-p-paper text-p-text shadow-2xl transition-transform duration-700 ease-out-expo max-lg:w-full",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-end px-28 pt-20 max-lg:px-[20px] max-lg:pt-[16px]">
          <button type="button" onClick={close} tabIndex={tab} className="flex items-center gap-12 p-mono text-p-text transition-opacity hover:opacity-60 max-lg:gap-[10px]" aria-label="Close">
            Close
            <span className="flex size-40 items-center justify-center bg-p-sand max-lg:size-[38px]">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
                <path d="m1 1 12 12M13 1 1 13" />
              </svg>
            </span>
          </button>
        </div>

        <div className="flex-1 px-48 pt-64 pb-48 max-lg:px-[24px] max-lg:pt-[48px] max-lg:pb-[36px]">
          {user ? (
            /* Signed in */
            <div>
              <h2 id="account-title" className="font-italiana fs-40 leading-[1.05] max-lg:text-[34px]">
                Welcome, {user.name.split(" ")[0]}
              </h2>
              <p className="mt-10 p-body fs-15 text-p-text/70 max-lg:mt-[8px] max-lg:text-[15px]">{user.email}</p>
              <ul className="mt-36 flex flex-col border-t border-p-text/12 max-lg:mt-[28px]">
                {[
                  { label: "Wishlist", href: "/wishlist" },
                  { label: "The collection", href: "/collection" },
                  { label: "Contact a Client Advisor", href: "/contact" },
                ].map((l) => (
                  <li key={l.href} className="border-b border-p-text/12">
                    <Link href={l.href} onClick={close} tabIndex={tab} className="group flex items-center justify-between py-16 p-mono max-lg:py-[14px]">
                      <span className="p-underline">{l.label}</span>
                      <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <ParfsButton theme="dark" onClick={onSignOut} disabled={busy} tabIndex={tab} className={cn(primary, "mt-36 max-lg:mt-[28px]")}>
                {busy ? "Signing out…" : "Sign out"}
              </ParfsButton>
            </div>
          ) : step === "email" ? (
            /* Step 1 — email */
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (EMAIL.test(email.trim())) go("password");
              }}
              noValidate
            >
              <h2 id="account-title" className="font-italiana fs-40 leading-[1.05] max-lg:text-[34px]">
                Sign in or create an account
              </h2>
              <p className="mt-10 max-w-360 p-body fs-15 leading-[1.5] text-p-text/75 max-lg:mt-[8px] max-lg:text-[15px]">Please enter your email to sign in or create an account.</p>
              <label className="mt-56 block max-lg:mt-[40px]">
                <span className={label}>Email *</span>
                <input ref={firstInput} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" tabIndex={tab} className={field} />
              </label>
              {consent}
              <ParfsButton theme="dark" solid type="submit" disabled={!EMAIL.test(email.trim())} tabIndex={tab} className={cn(primary, "mt-56 max-lg:mt-[40px]")}>
                Sign in
              </ParfsButton>
            </form>
          ) : step === "password" ? (
            /* Step 2a — existing customer */
            <form onSubmit={onSignIn} noValidate>
              <h2 id="account-title" className="font-italiana fs-40 leading-[1.05] max-lg:text-[34px]">
                Sign in
              </h2>
              <p className="mt-10 p-body fs-15 leading-[1.5] text-p-text/75 max-lg:mt-[8px] max-lg:text-[15px]">Enter your password to continue.</p>
              {emailRow}
              <label className="mt-28 block max-lg:mt-[24px]" htmlFor="account-password">
                <span className={label}>Password *</span>
              </label>
              {passwordInput("account-password", password, setPassword, "current-password", firstInput)}
              {error && (
                <p role="alert" className="mt-16 p-body fs-14 text-[#a2452f] max-lg:mt-[14px] max-lg:text-[14px]">
                  {error}
                </p>
              )}
              <ParfsButton theme="dark" solid type="submit" disabled={busy || !password} tabIndex={tab} className={cn(primary, "mt-40 max-lg:mt-[32px]")}>
                {busy ? "Signing in…" : "Sign in"}
              </ParfsButton>
              <p className="mt-28 border-t border-p-text/12 pt-24 p-body fs-15 text-p-text/75 max-lg:mt-[24px] max-lg:pt-[20px] max-lg:text-[15px]">
                New to PARFS?{" "}
                <button type="button" onClick={() => go("register")} tabIndex={tab} className="text-p-text underline underline-offset-4 hover:text-p-gold">
                  Create an account
                </button>
              </p>
            </form>
          ) : (
            /* Step 2b — new account */
            <form onSubmit={onRegister} noValidate>
              <h2 id="account-title" className="font-italiana fs-40 leading-[1.05] max-lg:text-[34px]">
                Create an account
              </h2>
              <p className="mt-10 p-body fs-15 leading-[1.5] text-p-text/75 max-lg:mt-[8px] max-lg:text-[15px]">Save your wishlist, check out faster and follow your orders.</p>
              {emailRow}
              {err("email")}
              <div className="mt-28 grid grid-cols-2 gap-20 max-lg:mt-[24px] max-lg:gap-[16px]">
                <label className="block">
                  <span className={label}>First name *</span>
                  <input ref={firstInput} required value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" tabIndex={tab} className={field} />
                </label>
                <label className="block">
                  <span className={label}>Last name *</span>
                  <input required value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" tabIndex={tab} className={field} />
                </label>
              </div>
              {err("name")}
              <label className="mt-24 block max-lg:mt-[20px]" htmlFor="account-new-password">
                <span className={label}>Password *</span>
              </label>
              {passwordInput("account-new-password", password, setPassword, "new-password")}
              <span className="mt-6 block p-body fs-12 text-p-grey max-lg:mt-[6px] max-lg:text-[12px]">At least 8 characters, with a letter and a number.</span>
              {err("password")}
              <label className="mt-24 block max-lg:mt-[20px]" htmlFor="account-confirm">
                <span className={label}>Confirm password *</span>
              </label>
              {passwordInput("account-confirm", confirm, setConfirm, "new-password")}
              {err("confirmPassword")}
              {consent}
              {error && (
                <p role="alert" className="mt-16 p-body fs-14 text-[#a2452f] max-lg:mt-[14px] max-lg:text-[14px]">
                  {error}
                </p>
              )}
              <ParfsButton theme="dark" solid type="submit" disabled={busy || !firstName.trim() || !lastName.trim() || !password || !confirm} tabIndex={tab} className={cn(primary, "mt-36 max-lg:mt-[28px]")}>
                {busy ? "Creating account…" : "Create account"}
              </ParfsButton>
              <p className="mt-28 border-t border-p-text/12 pt-24 p-body fs-15 text-p-text/75 max-lg:mt-[24px] max-lg:pt-[20px] max-lg:text-[15px]">
                Already have an account?{" "}
                <button type="button" onClick={() => go("password")} tabIndex={tab} className="text-p-text underline underline-offset-4 hover:text-p-gold">
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
}
