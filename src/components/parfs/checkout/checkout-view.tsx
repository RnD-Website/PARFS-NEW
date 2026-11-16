"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { parfsCatalog } from "@/content/parfs-catalog";
import { checkoutCountries, shippableCountries, shippingMethods, usStates } from "@/content/parfs-checkout";
import { formatMoney } from "@/lib/utils/money";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { cartCount, useCart } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { ParfsButton } from "../ui/parfs-button";
import { PaymentLogos } from "../ui/payment-logos";

type Field = "email" | "firstName" | "lastName" | "address" | "city" | "state" | "zip" | "phone";
const EMAIL = /^\S+@\S+\.\S+$/;
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

const input =
  "peer block w-full border border-p-text/20 bg-white/50 px-14 pt-20 pb-7 p-body fs-15 text-p-text outline-none transition-colors placeholder:text-transparent focus:border-p-text disabled:cursor-not-allowed disabled:bg-p-text/[0.04] max-lg:px-[12px] max-lg:text-[16px]";
const floatLabel =
  "pointer-events-none absolute top-1/2 left-14 -translate-y-1/2 p-body fs-14 text-p-grey transition-all duration-200 peer-focus:top-12 peer-focus:fs-11 peer-[:not(:placeholder-shown)]:top-12 peer-[:not(:placeholder-shown)]:fs-11 max-lg:left-[12px]";

/**
 * PARFS checkout — after Étoile's (Shopify) checkout, in PARFS design: express checkout, Contact,
 * Delivery, Shipping method, Payment and "Pay now" on the left; the order summary with discount code
 * and totals on a sand panel to the right (collapsible on phones).
 *
 * Payments aren't connected yet (they move to Shopify): no card details are collected — the card form
 * is shown disabled — and "Pay now" validates the details, then explains that payment isn't live.
 */
export function CheckoutView() {
  const hydrated = useHydrated();
  const lines = useCart((s) => s.lines);
  const user = useSession((s) => s.user);
  const items = hydrated ? lines : [];

  const [v, setV] = useState({
    email: "",
    news: true,
    country: "United States",
    firstName: "",
    lastName: "",
    company: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    sms: false,
  });
  const [shipping, setShipping] = useState<(typeof shippingMethods)[number]["id"]>("standard");
  const [payment, setPayment] = useState<"card" | "shoppay">("card");
  const [billingSame, setBillingSame] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [notice, setNotice] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [code, setCode] = useState("");
  const [codeMsg, setCodeMsg] = useState<string | null>(null);

  const email = v.email || user?.email || "";
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setV((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const priced = items.map((l) => {
    const info = parfsCatalog.find((c) => c.slug === l.slug);
    return { line: l, info, unit: info ? info.price : null };
  });
  const allUsd = priced.every((p) => p.unit !== null);
  const subtotal = priced.reduce((n, p) => n + (p.unit ?? 0) * p.line.quantity, 0);
  const canShip = shippableCountries.includes(v.country);
  const addressReady = canShip && v.address.trim().length > 2 && v.zip.trim().length >= 3;
  const ship = shippingMethods.find((m) => m.id === shipping)!;
  const total = subtotal + (addressReady ? ship.price : 0);
  const count = cartCount(items);

  function validate() {
    const e: Partial<Record<Field, string>> = {};
    if (!EMAIL.test(email.trim())) e.email = "Enter a valid email";
    if (!v.firstName.trim()) e.firstName = "Enter a first name";
    if (!v.lastName.trim()) e.lastName = "Enter a last name";
    if (v.address.trim().length < 3) e.address = "Enter an address";
    if (!v.city.trim()) e.city = "Enter a city";
    if (v.country === "United States" && !v.state) e.state = "Select a state";
    if (v.country === "United States" ? !/^\d{5}(-\d{4})?$/.test(v.zip.trim()) : v.zip.trim().length < 3) e.zip = "Enter a valid ZIP code";
    if (v.phone && v.phone.replace(/\D/g, "").length < 7) e.phone = "Enter a valid phone number";
    return e;
  }

  function onPay(e: React.FormEvent) {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    setNotice(false);
    if (Object.keys(found).length) {
      document.getElementById(`co-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setNotice(true);
  }

  const err = (k: Field) =>
    errors[k] ? (
      <span role="alert" className="mt-4 block p-body fs-12 text-[#a2452f] max-lg:text-[12px]">
        {errors[k]}
      </span>
    ) : null;
  const text = (k: Field | "company" | "apartment", label: string, opts: { type?: string; autoComplete?: string; className?: string } = {}) => (
    <label className={cn("relative block", opts.className)}>
      <input
        id={`co-${k}`}
        type={opts.type ?? "text"}
        placeholder={label}
        autoComplete={opts.autoComplete}
        value={k === "email" ? email : (v[k] as string)}
        onChange={set(k)}
        aria-invalid={!!errors[k as Field]}
        className={cn(input, errors[k as Field] && "border-[#a2452f]")}
      />
      <span className={floatLabel}>{label}</span>
      {err(k as Field)}
    </label>
  );

  if (hydrated && items.length === 0) {
    return (
      <section className="flex min-h-[70svh] flex-col items-center justify-center gap-20 bg-p-paper px-40 pt-120 pb-120 text-center text-p-text max-lg:px-[20px]">
        <p className="font-italiana fs-48 leading-none uppercase max-lg:text-[36px]">Your bag is empty</p>
        <p className="p-body fs-16 text-p-text/70 max-lg:text-[16px]">Add a fragrance to your bag to check out.</p>
        <ParfsButton theme="dark" solid href="/collection">
          Explore the collection
        </ParfsButton>
      </section>
    );
  }

  const summary = (
    <div className="flex flex-col gap-20 max-lg:gap-[18px]">
      <ul className="flex flex-col gap-16 max-lg:gap-[14px]">
        {priced.map(({ line, info, unit }) => (
          <li key={line.id} className="flex items-center gap-14 max-lg:gap-[12px]">
            <span className="relative shrink-0">
              <span className="relative block size-64 overflow-hidden border border-p-text/10 bg-p-paper max-lg:size-[60px]">
                {line.image && <Image src={info?.image ?? line.image} alt={line.name} fill sizes="70px" className="object-cover" />}
              </span>
              <span className="absolute -top-8 -right-8 flex h-20 min-w-20 items-center justify-center rounded-full bg-p-text px-5 font-mono-p fs-11 text-p-paper tabular-nums max-lg:h-[20px] max-lg:min-w-[20px] max-lg:text-[11px]">
                {line.quantity}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-italiana fs-20 leading-[1.1] max-lg:text-[18px]">{line.name}</span>
              {info && (
                <span className="mt-2 block p-mono-sm text-p-grey">
                  {info.concentration} · {info.volume}
                </span>
              )}
            </span>
            <span className="shrink-0 p-body fs-15 tabular-nums max-lg:text-[15px]">{unit !== null ? usd(unit * line.quantity) : formatMoney(line.unitPrice * line.quantity, line.currency)}</span>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.trim()) setCodeMsg("Enter a valid discount code or gift card");
        }}
        className="flex gap-10 max-lg:gap-[8px]"
      >
        <label className="relative block flex-1">
          <input value={code} onChange={(e) => (setCode(e.target.value), setCodeMsg(null))} placeholder="Discount code or gift card" className={input} />
          <span className={floatLabel}>Discount code or gift card</span>
        </label>
        <button type="submit" disabled={!code.trim()} className="shrink-0 bg-p-text px-22 fs-12 font-medium tracking-[0.08em] text-p-paper uppercase transition-[background-color,opacity] hover:bg-black disabled:cursor-not-allowed disabled:opacity-80 max-lg:px-[18px] max-lg:text-[12px]">
          Apply
        </button>
      </form>
      {codeMsg && (
        <p role="alert" className="-mt-10 p-body fs-12 text-[#a2452f] max-lg:text-[12px]">
          {codeMsg}
        </p>
      )}

      <dl className="flex flex-col gap-10 border-t border-p-text/12 pt-18 p-body fs-14 max-lg:gap-[8px] max-lg:pt-[16px] max-lg:text-[14px]">
        <div className="flex justify-between">
          <dt>
            Subtotal · {count} {count === 1 ? "item" : "items"}
          </dt>
          <dd className="tabular-nums">{allUsd ? usd(subtotal) : "—"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd className="text-p-text/70">{addressReady ? (ship.price ? usd(ship.price) : "Free") : "Enter shipping address"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Estimated taxes</dt>
          <dd className="text-p-text/70">Calculated at payment</dd>
        </div>
        <div className="mt-8 flex items-baseline justify-between border-t border-p-text/12 pt-14 max-lg:mt-[6px] max-lg:pt-[12px]">
          <dt className="font-italiana fs-24 max-lg:text-[22px]">Total</dt>
          <dd className="flex items-baseline gap-8">
            <span className="p-mono-sm text-p-grey">USD</span>
            <span className="p-body fs-20 font-medium tabular-nums max-lg:text-[20px]">{allUsd ? usd(total) : "—"}</span>
          </dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="bg-p-paper pt-72 text-p-text max-lg:pt-[60px]">
      {/* Phones: collapsible order summary */}
      <div className="border-b border-p-text/12 bg-p-sand lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between px-[20px] py-[16px]">
          <span className="p-mono">{summaryOpen ? "Hide" : "Show"} order summary {summaryOpen ? "−" : "+"}</span>
          <span className="p-body text-[17px] font-medium tabular-nums">{allUsd ? usd(total) : ""}</span>
        </button>
        <div className={cn("grid transition-[grid-template-rows] duration-500 ease-out-expo", summaryOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="px-[20px] pt-[4px] pb-[22px]">{summary}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1920px] grid-cols-[54fr_46fr] border-t border-p-text/10 max-lg:grid-cols-1 lg:bg-[linear-gradient(90deg,var(--p-paper)_54%,var(--p-sand)_54%)]">
        {/* Form column */}
        <form onSubmit={onPay} noValidate className="flex justify-end px-40 pt-40 pb-80 max-lg:px-[20px] max-lg:pt-[24px] max-lg:pb-[56px] lg:border-r lg:border-p-text/10 lg:pr-56">
          <div className="w-full max-w-560">
            {/* Express checkout */}
            <p className="text-center p-mono-sm text-p-grey">Express checkout</p>
            <button
              type="button"
              onClick={() => setNotice(true)}
              aria-label="Check out with Shop Pay"
              className="mt-12 flex h-48 w-full items-center justify-center gap-[6px] bg-[#5a31f4] text-white transition-[filter] hover:brightness-110 max-lg:mt-[10px] max-lg:h-[48px]"
            >
              <span aria-hidden className="font-sans text-[20px] leading-none font-bold tracking-[-0.04em]">
                shop
              </span>
              <span aria-hidden className="rounded-[4px] bg-white px-[5px] py-[2px] font-sans text-[12px] leading-none font-bold text-[#5a31f4]">
                Pay
              </span>
            </button>
            <div className="my-24 flex items-center gap-14 max-lg:my-[20px] max-lg:gap-[12px]">
              <span className="h-px flex-1 bg-p-text/12" />
              <span className="p-mono-sm text-p-grey">Or</span>
              <span className="h-px flex-1 bg-p-text/12" />
            </div>

            {/* Contact */}
            <Section
              title="Contact"
              aside={
                user ? null : (
                  <Link href="/account" className="p-mono-sm text-p-text underline underline-offset-4 hover:text-p-gold">
                    Sign in
                  </Link>
                )
              }
            >
              {text("email", "Email", { type: "email", autoComplete: "email" })}
              <Check checked={v.news} onChange={set("news")}>
                Yes, I&apos;d like to receive news from the Maison — early access, private launches and rituals.
              </Check>
            </Section>

            {/* Delivery */}
            <Section title="Delivery">
              <label className="relative block">
                <select value={v.country} onChange={set("country")} className={cn(input, "cursor-pointer appearance-none pr-40")}>
                  {checkoutCountries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="pointer-events-none absolute top-12 left-14 -translate-y-1/2 p-body fs-11 text-p-grey max-lg:left-[12px]">Country/Region</span>
                <Chevron />
              </label>
              {!canShip && <p className="p-body fs-13 text-[#a2452f] max-lg:text-[13px]">We currently deliver within the United States only.</p>}
              <div className="grid grid-cols-2 gap-12 max-lg:gap-[10px]">
                {text("firstName", "First name", { autoComplete: "given-name" })}
                {text("lastName", "Last name", { autoComplete: "family-name" })}
              </div>
              {text("company", "Company (optional)", { autoComplete: "organization" })}
              {text("address", "Address", { autoComplete: "address-line1" })}
              {text("apartment", "Apartment, suite, etc. (optional)", { autoComplete: "address-line2" })}
              <div className="grid grid-cols-3 gap-12 max-lg:grid-cols-1 max-lg:gap-[10px]">
                {text("city", "City", { autoComplete: "address-level2" })}
                {v.country === "United States" ? (
                  <label className="relative block">
                    <select id="co-state" value={v.state} onChange={set("state")} aria-invalid={!!errors.state} className={cn(input, "cursor-pointer appearance-none pr-40", errors.state && "border-[#a2452f]")}>
                      <option value="" />
                      {usStates.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <span className={cn("pointer-events-none absolute left-14 -translate-y-1/2 p-body text-p-grey transition-all max-lg:left-[12px]", v.state ? "top-12 fs-11" : "top-1/2 fs-14")}>State</span>
                    <Chevron />
                    {err("state")}
                  </label>
                ) : (
                  text("state", "State / province (optional)")
                )}
                {text("zip", v.country === "United States" ? "ZIP code" : "Postal code", { autoComplete: "postal-code" })}
              </div>
              {text("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
              <Check checked={v.sms} onChange={set("sms")}>
                Text me shipping updates.
              </Check>
            </Section>

            {/* Shipping method */}
            <Section title="Shipping method">
              {addressReady ? (
                <div className="border border-p-text/15">
                  {shippingMethods.map((m, i) => (
                    <label key={m.id} className={cn("flex cursor-pointer items-center gap-12 px-16 py-16 transition-colors max-lg:px-[14px] max-lg:py-[14px]", i > 0 && "border-t border-p-text/15", shipping === m.id && "bg-p-sand/60")}>
                      <input type="radio" name="shipping" checked={shipping === m.id} onChange={() => setShipping(m.id)} className="accent-[#221f1b]" />
                      <span className="flex-1">
                        <span className="block p-body fs-15 max-lg:text-[15px]">{m.label}</span>
                        <span className="block p-body fs-13 text-p-grey max-lg:text-[13px]">{m.detail}</span>
                      </span>
                      <span className="p-body fs-15 font-medium max-lg:text-[15px]">{m.price ? usd(m.price) : "Free"}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="bg-p-sand/60 px-16 py-16 p-body fs-14 text-p-text/70 max-lg:px-[14px] max-lg:text-[14px]">Enter your shipping address to view available shipping methods.</p>
              )}
            </Section>

            {/* Payment */}
            <Section title="Payment" sub="All transactions are secure and encrypted.">
              <div className="border border-p-text/15">
                <label className={cn("flex cursor-pointer items-center gap-12 px-16 py-16 max-lg:px-[14px] max-lg:py-[14px]", payment === "card" && "bg-p-sand/60")}>
                  <input type="radio" name="payment" checked={payment === "card"} onChange={() => setPayment("card")} className="accent-[#221f1b]" />
                  <span className="flex-1 p-body fs-15 whitespace-nowrap max-lg:text-[15px]">Credit card</span>
                  <PaymentLogos className="shrink-0 max-lg:gap-[4px]" />
                </label>
                {payment === "card" && (
                  <div className="flex flex-col gap-10 border-t border-p-text/15 bg-p-sand/30 px-16 py-16 max-lg:gap-[10px] max-lg:px-[14px] max-lg:py-[14px]">
                    {[["Card number"], ["Expiration date (MM / YY)", "Security code"], ["Name on card"]].map((row) => (
                      <div key={row[0]} className="grid gap-10" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }}>
                        {row.map((l) => (
                          <label key={l} className="relative block">
                            <input disabled placeholder={l} aria-label={`${l} (available when payments go live)`} className={input} />
                            <span className={floatLabel}>{l}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                    <p className="p-body fs-12 text-p-grey max-lg:text-[12px]">Card payments open when checkout goes live — no card details are collected yet.</p>
                    <Check checked={billingSame} onChange={(e) => setBillingSame(e.target.checked)}>
                      Use shipping address as billing address
                    </Check>
                  </div>
                )}
                <label className={cn("flex cursor-pointer items-center gap-12 border-t border-p-text/15 px-16 py-16 max-lg:px-[14px] max-lg:py-[14px]", payment === "shoppay" && "bg-p-sand/60")}>
                  <input type="radio" name="payment" checked={payment === "shoppay"} onChange={() => setPayment("shoppay")} className="accent-[#221f1b]" />
                  <span className="flex-1 p-body fs-15 max-lg:text-[15px]">Shop Pay</span>
                  <span className="rounded-[3px] bg-[#5a31f4] px-6 py-2 font-sans text-[11px] font-bold text-white">shop</span>
                </label>
              </div>
            </Section>

            {/* Pay */}
            <div className="mt-32 max-lg:mt-[28px]">
              {notice && (
                <div role="status" className="mb-20 border border-p-gold/50 bg-p-gold/10 px-18 py-16 max-lg:mb-[16px] max-lg:px-[16px]">
                  <p className="font-italiana fs-22 leading-[1.15] max-lg:text-[20px]">Payments aren&apos;t switched on yet</p>
                  <p className="mt-6 p-body fs-14 leading-[1.5] text-p-text/75 max-lg:text-[14px]">
                    Your details look good and your bag is saved. Checkout opens as soon as PARFS payments go live — nothing has been charged.
                  </p>
                </div>
              )}
              <ParfsButton theme="dark" solid type="submit" className="w-full [&>span:first-child]:flex-1 [&>span:first-child]:justify-center">
                Pay now{allUsd ? ` — ${usd(total)}` : ""}
              </ParfsButton>
            </div>

            <nav aria-label="Policies" className="mt-36 flex flex-wrap gap-x-18 gap-y-8 border-t border-p-text/12 pt-20 max-lg:mt-[28px] max-lg:gap-x-[16px] max-lg:pt-[18px]">
              {[
                ["Refund policy", "/legal/returns"],
                ["Shipping", "/legal/shipping"],
                ["Privacy policy", "/legal/privacy"],
                ["Terms of sale", "/legal/terms"],
                ["Contact", "/contact"],
              ].map(([l, h]) => (
                <Link key={h} href={h} className="p-mono-sm text-p-grey underline underline-offset-4 hover:text-p-text">
                  {l}
                </Link>
              ))}
            </nav>
          </div>
        </form>

        {/* Summary column (desktop) */}
        <aside aria-label="Order summary" className="bg-p-sand px-40 pt-40 pb-80 max-lg:hidden lg:pl-56">
          <div className="sticky top-40 max-w-440">{summary}</div>
        </aside>
      </div>
    </div>
  );
}

function Section({ title, sub, aside, children }: { title: string; sub?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-32 first:mt-0 max-lg:mt-[28px]">
      <div className="mb-12 flex items-baseline justify-between max-lg:mb-[10px]">
        <h2 className="font-italiana fs-28 leading-none max-lg:text-[24px]">{title}</h2>
        {aside}
      </div>
      {sub && <p className="-mt-4 mb-12 p-body fs-13 text-p-grey max-lg:mb-[10px] max-lg:text-[13px]">{sub}</p>}
      <div className="flex flex-col gap-12 max-lg:gap-[10px]">{children}</div>
    </section>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-10 p-body fs-13 leading-[1.45] text-p-text/80 max-lg:text-[13px]">
      <input type="checkbox" checked={checked} onChange={onChange} className="mt-2 size-16 shrink-0 accent-[#221f1b] max-lg:size-[16px]" />
      <span>{children}</span>
    </label>
  );
}

function Chevron() {
  return (
    <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className="pointer-events-none absolute top-1/2 right-14 -translate-y-1/2 text-p-grey" fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}
