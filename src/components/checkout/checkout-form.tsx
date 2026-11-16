"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/orders/schemas";
import { cartSubtotal, useCart } from "@/stores/cart";
import { useSession } from "@/stores/session";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import { useCartSync } from "@/components/commerce/use-cart-sync";
import { storePolicy } from "@/content/site";
import { allDistricts } from "@/content/bd-districts";
import { formatMoney } from "@/lib/utils/money";
import { cn } from "@/lib/utils/cn";
import { Input, Select, Textarea, Checkbox } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon, type IconName } from "@/components/icons/icon";

type SavedAddress = {
  id: string;
  label: string | null;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  area: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  isDefault: boolean;
};

const PAYMENT_ICONS: Record<string, IconName> = { COD: "wallet", BKASH: "call", NAGAD: "call", CARD: "card" };

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[24px] bg-card p-5 sm:p-6" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-h4">
        <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[14px] font-bold text-white">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

export function CheckoutForm({ testMode }: { testMode: boolean }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const user = useSession((s) => s.user);
  const sessionLoaded = useSession((s) => s.loaded);
  const { lines, syncing, resync } = useCartSync();
  const [saved, setSaved] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("new");
  const [serverError, setServerError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      line1: "",
      line2: "",
      area: "",
      city: "",
      district: "",
      postalCode: "",
      deliveryMethod: "standard",
      paymentMethod: "COD",
      notes: "",
      saveAddress: true,
    },
  });
  const { register, handleSubmit, setValue, setError, formState, control } = form;
  // Special instructions written in the cart drawer carry over into the order notes.
  useEffect(() => {
    const note = useCart.getState().note;
    if (note) setValue("notes", note);
  }, [setValue]);
  const e = formState.errors;

  const applyAddress = (a: SavedAddress) => {
    setSelectedAddress(a.id);
    setValue("name", a.fullName);
    setValue("phone", a.phone);
    setValue("line1", a.line1);
    setValue("line2", a.line2 ?? "");
    setValue("area", a.area ?? "");
    setValue("city", a.city);
    setValue("district", a.district);
    setValue("postalCode", a.postalCode ?? "");
    setValue("saveAddress", false);
  };

  // Prefill from the account.
  useEffect(() => {
    if (!user) return;
    if (!form.getValues("email")) setValue("email", user.email);
    if (!form.getValues("name")) setValue("name", user.name);
    if (!form.getValues("phone") && user.phone) setValue("phone", user.phone);
    fetch("/api/account/addresses")
      .then((r) => r.json())
      .then((d: { addresses: SavedAddress[] }) => {
        setSaved(d.addresses);
        const def = d.addresses.find((a) => a.isDefault) ?? d.addresses[0];
        if (def) applyAddress(def);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const subtotal = cartSubtotal(lines);
  const deliveryMethod = useWatch({ control, name: "deliveryMethod" });
  const paymentMethod = useWatch({ control, name: "paymentMethod" });
  const fees = useMemo(
    () =>
      Object.fromEntries(
        storePolicy.deliveryMethods.map((m) => [m.id, m.id === "standard" && subtotal >= storePolicy.freeShippingThreshold ? 0 : m.fee]),
      ) as Record<string, number>,
    [subtotal],
  );
  const shipping = fees[deliveryMethod] ?? 0;
  const total = subtotal + shipping;

  const onSubmit = handleSubmit(async (details) => {
    setServerError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ details, lines: lines.map((l) => ({ variantId: l.id, quantity: l.quantity })) }),
    });
    const data = (await res.json().catch(() => ({}))) as { redirectUrl?: string; error?: string; fields?: Record<string, string> };
    if (!res.ok || !data.redirectUrl) {
      if (data.fields) for (const [k, msg] of Object.entries(data.fields)) setError(k as keyof CheckoutInput, { message: msg });
      setServerError(data.error ?? "Something went wrong. Please try again.");
      if (res.status === 409) resync();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (data.redirectUrl.startsWith("http")) window.location.assign(data.redirectUrl);
    else router.push(data.redirectUrl);
  });

  if (!hydrated) return <div className="container-page min-h-[60vh] py-16" aria-busy />;

  if (!lines.length) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
        <h1 className="text-h2">Your cart is empty</h1>
        <p className="text-body text-ink-muted">Add something you love, then come back to check out.</p>
        <ButtonLink href="/shop" arrow>
          Continue shopping
        </ButtonLink>
      </div>
    );
  }

  const summary = (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
          <li key={l.id} className="flex items-center gap-3">
            <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-muted">
              {l.image && <Image src={l.image} alt="" fill sizes="64px" className="object-cover" />}
              <span className="absolute -top-0 -right-0 flex size-5 items-center justify-center rounded-bl-lg bg-ink text-[11px] font-bold text-white">{l.quantity}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-semibold">{l.name}</span>
              {l.variantTitle && <span className="block text-caption text-ink-muted">{l.variantTitle}</span>}
            </span>
            <span className="text-body-sm font-semibold tabular-nums">{formatMoney(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="flex flex-col gap-2 border-t border-line pt-4 text-body-sm">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatMoney(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Delivery</dt>
          <dd className="tabular-nums">{shipping === 0 ? "Free" : formatMoney(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-body">
          <dt className="font-semibold">Total</dt>
          <dd className="text-price tabular-nums">{formatMoney(total)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <div className="container-page py-8 lg:py-12">
      <h1 className="text-h2">Checkout</h1>
      {!user && sessionLoaded && (
        <p className="mt-2 text-body-sm text-ink-muted">
          Have an account?{" "}
          <Link href="/account/login?next=/checkout" className="font-semibold text-ink underline underline-offset-4">
            Sign in
          </Link>{" "}
          for faster checkout — or continue as a guest.
        </p>
      )}

      {/* Mobile summary toggle */}
      <div className="mt-6 rounded-[20px] bg-card lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((v) => !v)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between p-4 text-body-sm font-semibold">
          <span className="flex items-center gap-2">
            <Icon name="bag" size={18} /> {summaryOpen ? "Hide" : "Show"} order summary
          </span>
          <span className="text-price tabular-nums">{formatMoney(total)}</span>
        </button>
        {summaryOpen && <div className="px-4 pb-4">{summary}</div>}
      </div>

      {serverError && (
        <p role="alert" className="mt-6 flex items-start gap-2 rounded-2xl bg-danger/10 px-4 py-3 text-body-sm text-danger">
          <Icon name="alert" size={18} className="mt-0.5 shrink-0" /> {serverError}
        </p>
      )}

      <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12">
        <div className="flex flex-col gap-5">
          <Section n={1} title="Contact">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" autoComplete="email" required error={e.email?.message} {...register("email")} hint="We’ll send your order confirmation here." />
              <Input label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required error={e.phone?.message} {...register("phone")} hint="For delivery updates by SMS." />
            </div>
          </Section>

          <Section n={2} title="Delivery address">
            {saved.length > 0 && (
              <div className="mb-5 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Saved addresses">
                {saved.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    role="radio"
                    aria-checked={selectedAddress === a.id}
                    onClick={() => applyAddress(a)}
                    className={cn("rounded-2xl border-[1.5px] p-3 text-left text-body-sm transition-colors", selectedAddress === a.id ? "border-ink bg-white" : "border-line hover:border-ink/40")}
                  >
                    <span className="block font-semibold">{a.label || a.fullName}</span>
                    <span className="block text-ink-muted">
                      {a.line1}, {a.city}, {a.district}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  role="radio"
                  aria-checked={selectedAddress === "new"}
                  onClick={() => {
                    setSelectedAddress("new");
                    for (const k of ["line1", "line2", "area", "city", "district", "postalCode"] as const) setValue(k, "");
                    setValue("saveAddress", true);
                  }}
                  className={cn("flex items-center gap-2 rounded-2xl border-[1.5px] border-dashed p-3 text-body-sm font-semibold", selectedAddress === "new" ? "border-ink" : "border-line hover:border-ink/40")}
                >
                  <Icon name="add" size={16} /> New address
                </button>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" autoComplete="name" required error={e.name?.message} wrapperClassName="sm:col-span-2" {...register("name")} />
              <Input label="Street address" autoComplete="address-line1" placeholder="House, road, block" required error={e.line1?.message} wrapperClassName="sm:col-span-2" {...register("line1")} />
              <Input label="Apartment, floor, landmark (optional)" autoComplete="address-line2" error={e.line2?.message} wrapperClassName="sm:col-span-2" {...register("line2")} />
              <Input label="Area / thana (optional)" error={e.area?.message} {...register("area")} />
              <Input label="City / upazila" autoComplete="address-level2" required error={e.city?.message} {...register("city")} />
              <Select label="District" required error={e.district?.message} {...register("district")}>
                <option value="">Select district</option>
                {allDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
              <Input label="Postcode (optional)" inputMode="numeric" autoComplete="postal-code" error={e.postalCode?.message} {...register("postalCode")} />
            </div>
            {user && selectedAddress === "new" && <Checkbox label="Save this address to my account" className="mt-4" {...register("saveAddress")} />}
          </Section>

          <Section n={3} title="Delivery method">
            <div className="grid gap-3" role="radiogroup" aria-label="Delivery method">
              {storePolicy.deliveryMethods.map((m) => (
                <label
                  key={m.id}
                  className={cn("flex cursor-pointer items-center gap-4 rounded-2xl border-[1.5px] bg-white p-4 transition-colors", deliveryMethod === m.id ? "border-ink" : "border-line hover:border-ink/40")}
                >
                  <input type="radio" value={m.id} className="size-5 accent-ink" {...register("deliveryMethod")} />
                  <span className="flex-1">
                    <span className="block text-label">{m.label}</span>
                    <span className="block text-body-sm text-ink-muted">{m.description}</span>
                  </span>
                  <span className="text-body font-semibold tabular-nums">{fees[m.id] === 0 ? "Free" : formatMoney(fees[m.id])}</span>
                </label>
              ))}
            </div>
          </Section>

          <Section n={4} title="Payment">
            {testMode && (
              <p className="mb-4 flex items-start gap-2 rounded-xl bg-violet-soft px-3 py-2.5 text-body-sm text-ink">
                <Icon name="info" size={18} className="mt-0.5 shrink-0 text-violet" />
                Online payments are in <strong>test mode</strong> until SSLCommerz credentials are added — no real money is charged.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {storePolicy.paymentMethods.map((m) => (
                <label
                  key={m.id}
                  className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border-[1.5px] bg-white p-4 transition-colors", paymentMethod === m.id ? "border-ink" : "border-line hover:border-ink/40")}
                >
                  <input type="radio" value={m.id} className="mt-1 size-5 accent-ink" {...register("paymentMethod")} />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-label">
                      <Icon name={PAYMENT_ICONS[m.id]} size={18} /> {m.label}
                    </span>
                    <span className="mt-1 block text-body-sm text-ink-muted">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <Textarea label="Order notes (optional)" placeholder="Delivery instructions, gift message…" className="min-h-[96px]" wrapperClassName="mt-5" error={e.notes?.message} {...register("notes")} />
          </Section>
        </div>

        <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-6">
          <div className="hidden rounded-[24px] bg-card p-6 lg:block">
            <h2 className="mb-4 text-h4">Order summary</h2>
            {summary}
          </div>
          <Button type="submit" size="lg" fullWidth arrow loading={formState.isSubmitting} disabled={syncing}>
            {paymentMethod === "COD" ? `Place order · ${formatMoney(total)}` : `Pay ${formatMoney(total)}`}
          </Button>
          <p className="text-center text-caption text-ink-muted">
            By placing your order you agree to our{" "}
            <Link href="/policies/terms" className="underline">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/policies/returns" className="underline">
              returns policy
            </Link>
            .
          </p>
        </aside>
      </form>
    </div>
  );
}
