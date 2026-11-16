"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { addressSchema } from "@/lib/auth/schemas";
import { allDistricts } from "@/content/bd-districts";
import { Input, Select, Checkbox } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { useUI } from "@/stores/ui";

type Address = {
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
type FormValues = z.input<typeof addressSchema>;

const empty: FormValues = { label: "", fullName: "", phone: "", line1: "", line2: "", area: "", city: "", district: "", postalCode: "", isDefault: false };

export function AddressManager({ initial }: { initial: Address[] }) {
  const [list, setList] = useState(initial);
  const [editing, setEditing] = useState<string | "new" | null>(initial.length ? null : "new");
  const [error, setError] = useState<string | null>(null);
  const toast = useUI((s) => s.toast);
  const form = useForm<FormValues>({ resolver: zodResolver(addressSchema), defaultValues: empty });
  const e = form.formState.errors;

  const reload = async () => {
    const d = (await (await fetch("/api/account/addresses")).json()) as { addresses: Address[] };
    setList(d.addresses);
  };
  const startEdit = (a?: Address) => {
    setError(null);
    form.reset(a ? { label: a.label ?? "", fullName: a.fullName, phone: a.phone, line1: a.line1, line2: a.line2 ?? "", area: a.area ?? "", city: a.city, district: a.district, postalCode: a.postalCode ?? "", isDefault: a.isDefault } : empty);
    setEditing(a ? a.id : "new");
  };
  const submit = form.handleSubmit(async (v) => {
    setError(null);
    const res = await fetch("/api/account/addresses", {
      method: editing === "new" ? "POST" : "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(editing === "new" ? v : { ...v, id: editing }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
    if (!res.ok) {
      for (const [k, m] of Object.entries(data.fields ?? {})) form.setError(k as keyof FormValues, { message: m });
      return setError(data.error ?? "Couldn't save the address.");
    }
    await reload();
    setEditing(null);
    toast({ title: "Address saved" });
  });
  const remove = async (id: string) => {
    if (!window.confirm("Delete this address?")) return;
    await fetch("/api/account/addresses", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ id }) });
    await reload();
    toast({ title: "Address deleted" });
  };

  return (
    <section aria-labelledby="addr-title" className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 id="addr-title" className="text-h3">
          Saved addresses
        </h2>
        {editing === null && (
          <Button size="sm" icon="add" onClick={() => startEdit()}>
            Add address
          </Button>
        )}
      </div>

      {editing !== null && (
        <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[24px] bg-card p-5 sm:p-6">
          <h3 className="text-h4">{editing === "new" ? "New address" : "Edit address"}</h3>
          {error && <p role="alert" className="text-body-sm text-danger">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Label (optional)" placeholder="Home, Office…" error={e.label?.message} {...form.register("label")} />
            <Input label="Full name" autoComplete="name" required error={e.fullName?.message} {...form.register("fullName")} />
            <Input label="Mobile number" type="tel" placeholder="01XXXXXXXXX" required error={e.phone?.message} {...form.register("phone")} />
            <Input label="Street address" required error={e.line1?.message} {...form.register("line1")} />
            <Input label="Apartment, floor, landmark (optional)" error={e.line2?.message} {...form.register("line2")} />
            <Input label="Area / thana (optional)" error={e.area?.message} {...form.register("area")} />
            <Input label="City / upazila" required error={e.city?.message} {...form.register("city")} />
            <Select label="District" required error={e.district?.message} {...form.register("district")}>
              <option value="">Select district</option>
              {allDistricts.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </Select>
            <Input label="Postcode (optional)" inputMode="numeric" error={e.postalCode?.message} {...form.register("postalCode")} />
          </div>
          <Checkbox label="Use as my default address" {...form.register("isDefault")} />
          <div className="flex gap-3">
            <Button type="submit" loading={form.formState.isSubmitting}>
              Save address
            </Button>
            {list.length > 0 && (
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      )}

      {list.length > 0 && (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="flex flex-col gap-3 rounded-[24px] bg-card p-5">
              <div className="flex items-center gap-2">
                <p className="text-label">{a.label || a.fullName}</p>
                {a.isDefault && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">Default</span>}
              </div>
              <address className="text-body-sm text-ink-2 not-italic">
                {a.fullName} · {a.phone}
                <br />
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {[a.area, a.city, a.district, a.postalCode].filter(Boolean).join(", ")}
              </address>
              <div className="mt-auto flex gap-2">
                <Button size="sm" variant="outline" icon="edit" onClick={() => startEdit(a)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>
                  <Icon name="trash" size={16} /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
