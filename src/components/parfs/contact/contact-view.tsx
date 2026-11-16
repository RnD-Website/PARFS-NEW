"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { contactPage } from "@/content/parfs-contact";
import { cn } from "@/lib/utils/cn";
import { scrollToTarget } from "../motion/smooth-scroll";
import { ParfsButton } from "../ui/parfs-button";

const { form: F } = contactPage;
const label = "p-mono-sm text-p-grey";
const field =
  "mt-6 block w-full border-0 border-b border-p-text/25 bg-transparent px-0 py-10 p-body fs-16 text-p-text outline-none transition-colors placeholder:text-p-grey/70 focus:border-p-text max-lg:mt-[6px] max-lg:py-[10px] max-lg:text-[16px]";

/**
 * PARFS contact page — after dior.com/…/contact-couture: centred title + service hours, three service
 * columns (call · email · your order lookup), a row of help tiles (consultation · FAQs · delivery &
 * returns · newsletter) and a "Write to us" form. PARFS type throughout; the form posts to /api/contact
 * and the order lookup to /api/track (both existing store endpoints).
 */
export function ContactView() {
  const [subject, setSubject] = useState("");
  const formRef = useRef<HTMLElement>(null);

  const openService = (href: string, presetSubject?: string) => (e: React.MouseEvent) => {
    if (href === "#write-us") {
      e.preventDefault();
      if (presetSubject) setSubject(presetSubject);
      if (formRef.current) scrollToTarget(formRef.current.getBoundingClientRect().top + window.scrollY - 96);
    } else if (href === "#newsletter") {
      e.preventDefault();
      scrollToTarget("footer");
    }
  };

  return (
    <div className="bg-p-paper text-p-text">
      {/* Head */}
      <header className="mx-auto max-w-760 px-40 pt-168 pb-80 text-center max-lg:px-[20px] max-lg:pt-[120px] max-lg:pb-[56px]">
        <h1 className="font-italiana fs-88 leading-none tracking-[0.02em] uppercase max-lg:text-[52px]" data-reveal="fade" data-reveal-now>
          {contactPage.title}
        </h1>
        <p className="mt-28 p-body fs-17 leading-[1.55] text-p-text max-lg:mt-[22px] max-lg:text-[16px]" data-reveal="fade" data-reveal-now data-reveal-delay="0.1">
          {contactPage.intro}
        </p>
        <p className="mt-8 p-body fs-17 leading-[1.55] text-p-text/70 max-lg:mt-[8px] max-lg:text-[16px]" data-reveal="fade" data-reveal-now data-reveal-delay="0.15">
          {contactPage.sub}
        </p>
      </header>

      {/* Three channels */}
      <section aria-label="Ways to reach us" className="mx-auto max-w-[1920px] px-40 max-lg:px-[20px]">
        <div className="grid grid-cols-3 border-t border-p-text/12 max-lg:grid-cols-1">
          {contactPage.channels.map((c, i) => (
            <div key={c.no} className={cn("flex flex-col gap-12 py-40 pr-40 max-lg:gap-[12px] max-lg:py-[32px] max-lg:pr-0", i > 0 && "border-p-text/12 lg:border-l lg:pl-40", "max-lg:border-b max-lg:border-p-text/12")} data-reveal="fade" data-reveal-delay={String(i * 0.08)}>
              <p className="flex gap-10 p-mono">
                <span className="text-p-grey">[{c.no}]</span>
                <span>{c.title}</span>
              </p>
              <p className="p-body fs-16 leading-[1.55] text-p-text/80 max-lg:text-[16px]">{c.text}</p>
              <a href={c.action.href} className="w-fit font-italiana fs-32 leading-[1.1] max-lg:text-[26px]">
                <span className="p-underline">{c.action.label}</span>
              </a>
              <p className="p-body fs-13 leading-[1.5] text-p-grey max-lg:text-[13px]">{c.note}</p>
            </div>
          ))}
          <OrderLookup />
        </div>
      </section>

      {/* Help tiles */}
      <section aria-label="More help" className="mx-auto max-w-[1920px] px-40 pt-40 pb-120 max-lg:px-[20px] max-lg:pt-[24px] max-lg:pb-[80px]">
        <ul className="grid grid-cols-4 gap-16 max-lg:grid-cols-1 max-lg:gap-[12px]">
          {contactPage.services.map((s, i) => (
            <li key={s.title} className="flex flex-col gap-14 bg-p-sand p-28 max-lg:gap-[12px] max-lg:p-[22px]" data-reveal="fade" data-reveal-delay={String(i * 0.06)}>
              <h2 className="font-italiana fs-28 leading-[1.1] max-lg:text-[24px]">{s.title}</h2>
              <p className="flex-1 p-body fs-15 leading-[1.55] text-p-text/75 max-lg:text-[15px]">{s.text}</p>
              <Link href={s.href} onClick={openService(s.href, "subject" in s ? s.subject : undefined)} className="group mt-8 inline-flex w-fit items-center gap-8 p-mono max-lg:mt-[6px] max-lg:gap-[8px]">
                <span className="p-underline">{s.cta}</span>
                <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Write to us */}
      <section ref={formRef} id="write-us" aria-labelledby="write-us-title" className="border-t border-p-text/12">
        <div className="mx-auto grid max-w-[1920px] grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] gap-80 px-40 pt-100 pb-140 max-lg:grid-cols-1 max-lg:gap-[32px] max-lg:px-[20px] max-lg:pt-[64px] max-lg:pb-[96px]">
          <div data-reveal="fade">
            <h2 id="write-us-title" className="font-italiana fs-56 leading-[1] uppercase max-lg:text-[40px]">
              {F.title}
            </h2>
            <p className="mt-20 max-w-360 p-body fs-16 leading-[1.55] text-p-text/75 max-lg:mt-[16px] max-lg:text-[16px]">{F.text}</p>
          </div>
          <WriteUsForm subject={subject} onSubject={setSubject} />
        </div>
      </section>
    </div>
  );
}

/** "Your order" — guest lookup by email + order number (→ /api/track → tracking page). */
function OrderLookup() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [state, setState] = useState<{ busy: boolean; error?: string }>({ busy: false });
  const o = contactPage.order;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState({ busy: true });
    const res = await fetch("/api/track", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, orderNumber }) }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { redirectUrl?: string; error?: string } | undefined;
    if (!res?.ok || !data?.redirectUrl) return setState({ busy: false, error: data?.error ?? "We couldn't find that order." });
    router.push(data.redirectUrl);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-12 py-40 max-lg:gap-[12px] max-lg:py-[32px] lg:border-l lg:border-p-text/12 lg:pl-40" data-reveal="fade" data-reveal-delay="0.16">
      <p className="flex gap-10 p-mono">
        <span className="text-p-grey">[{o.no}]</span>
        <span>{o.title}</span>
      </p>
      <p className="p-body fs-16 leading-[1.55] text-p-text/80 max-lg:text-[16px]">{o.text}</p>
      <p className="p-body fs-13 leading-[1.5] text-p-grey max-lg:text-[13px]">{o.sub}</p>
      <label className="mt-4 block">
        <span className={label}>Email *</span>
        <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
      </label>
      <label className="block">
        <span className={label}>Order number *</span>
        <input required autoComplete="off" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className={field} />
      </label>
      {state.error && (
        <p role="alert" className="p-body fs-13 text-[#a2452f] max-lg:text-[13px]">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={state.busy || !email || !orderNumber} className="group mt-8 inline-flex w-fit items-center gap-8 p-mono transition-opacity disabled:opacity-40 max-lg:mt-[6px] max-lg:gap-[8px]">
        <span className="p-underline">{state.busy ? "Checking…" : "Continue"}</span>
        <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-4">→</span>
      </button>
    </form>
  );
}

type Errors = Partial<Record<"firstName" | "lastName" | "email" | "subject" | "message", string>>;

/** "Write to us" — posts to /api/contact (name, email, phone, subject, message). */
function WriteUsForm({ subject, onSubject }: { subject: string; onSubject: (s: string) => void }) {
  const [v, setV] = useState({ title: "", firstName: "", lastName: "", country: F.countries[0], email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<{ state: "idle" | "sending" | "sent" | "error"; message?: string }>({ state: "idle" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV((p) => ({ ...p, [k]: e.target.value }));

  function validate(): Errors {
    const e: Errors = {};
    if (!v.firstName.trim()) e.firstName = "Enter your first name";
    if (!v.lastName.trim()) e.lastName = "Enter your last name";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) e.email = "Enter a valid email address";
    if (!subject) e.subject = "Choose a subject";
    if (v.message.trim().length < 10) e.message = "Tell us a little more (10+ characters)";
    return e;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return setStatus({ state: "idle" });
    setStatus({ state: "sending" });
    const name = [v.title && v.title !== "Prefer not to say" ? v.title : "", v.firstName.trim(), v.lastName.trim()].filter(Boolean).join(" ");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email: v.email.trim(), phone: v.phone.trim(), subject, message: `${v.message.trim()}\n\n— Country / region: ${v.country}` }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => ({}))) as { error?: string } | undefined;
    if (!res?.ok) return setStatus({ state: "error", message: data?.error ?? "Something went wrong — please try again." });
    setStatus({ state: "sent" });
    setV((p) => ({ ...p, message: "" }));
  }

  if (status.state === "sent") {
    return (
      <div className="flex flex-col items-start gap-16 border-t border-p-text/12 pt-40 max-lg:gap-[14px] max-lg:pt-[32px]" role="status">
        <p className="font-italiana fs-40 leading-[1.05] max-lg:text-[32px]">Thank you{v.firstName ? `, ${v.firstName.trim()}` : ""}.</p>
        <p className="max-w-480 p-body fs-16 leading-[1.55] text-p-text/75 max-lg:text-[16px]">Your message has reached the Maison. A Client Advisor will reply to {v.email.trim()} within one business day.</p>
        <button type="button" onClick={() => setStatus({ state: "idle" })} className="p-mono underline underline-offset-4">
          Send another message
        </button>
      </div>
    );
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <span role="alert" className="mt-6 block p-body fs-13 text-[#a2452f] max-lg:mt-[6px] max-lg:text-[13px]">
        {errors[k]}
      </span>
    ) : null;
  const remaining = F.messageMax - v.message.length;

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-2 gap-x-32 gap-y-28 max-lg:grid-cols-1 max-lg:gap-y-[22px]" data-reveal="fade" data-reveal-delay="0.1">
      <label className="block">
        <span className={label}>Title</span>
        <select value={v.title} onChange={set("title")} className={cn(field, "cursor-pointer appearance-none")}>
          <option value="">—</option>
          {F.titles.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>Country / region</span>
        <select value={v.country} onChange={set("country")} className={cn(field, "cursor-pointer appearance-none")}>
          {F.countries.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className={label}>First name *</span>
        <input autoComplete="given-name" value={v.firstName} onChange={set("firstName")} aria-invalid={!!errors.firstName} className={field} />
        {err("firstName")}
      </label>
      <label className="block">
        <span className={label}>Last name *</span>
        <input autoComplete="family-name" value={v.lastName} onChange={set("lastName")} aria-invalid={!!errors.lastName} className={field} />
        {err("lastName")}
      </label>
      <label className="block">
        <span className={label}>Email *</span>
        <input type="email" autoComplete="email" value={v.email} onChange={set("email")} aria-invalid={!!errors.email} className={field} />
        {err("email")}
      </label>
      <label className="block">
        <span className={label}>Telephone</span>
        <input type="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} maxLength={20} className={field} />
      </label>
      <label className="col-span-2 block max-lg:col-span-1">
        <span className={label}>Subject *</span>
        <select value={subject} onChange={(e) => onSubject(e.target.value)} aria-invalid={!!errors.subject} className={cn(field, "cursor-pointer appearance-none")}>
          <option value="">Choose a subject</option>
          {F.subjects.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        {err("subject")}
      </label>
      <label className="col-span-2 block max-lg:col-span-1">
        <span className="flex items-baseline justify-between">
          <span className={label}>Your message *</span>
          <span className={cn("p-mono-sm tabular-nums", remaining < 40 ? "text-p-text" : "text-p-grey")}>{remaining} characters remaining</span>
        </span>
        <textarea rows={5} maxLength={F.messageMax} value={v.message} onChange={set("message")} aria-invalid={!!errors.message} className={cn(field, "resize-none")} />
        {err("message")}
      </label>

      <div className="col-span-2 flex flex-col gap-16 max-lg:col-span-1 max-lg:gap-[14px]">
        {status.state === "error" && (
          <p role="alert" className="p-body fs-14 text-[#a2452f] max-lg:text-[14px]">
            {status.message}
          </p>
        )}
        <ParfsButton theme="dark" solid type="submit" disabled={status.state === "sending"} className="w-fit disabled:opacity-60">
          {status.state === "sending" ? "Sending…" : "Send"}
        </ParfsButton>
        <p className="p-mono-sm text-p-grey">* All fields marked with an asterisk are required</p>
        <p className="max-w-640 p-body fs-13 leading-[1.55] text-p-grey max-lg:text-[13px]">
          By clicking “Send” you confirm you have read our{" "}
          <Link href="/legal/privacy" className="text-p-text underline underline-offset-[3px] hover:text-p-gold">
            Privacy Policy
          </Link>{" "}
          and agree to PARFS processing your personal information to answer your request. You can ask us to access, correct or delete it at any time.
        </p>
      </div>
    </form>
  );
}
