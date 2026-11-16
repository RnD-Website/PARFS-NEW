"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { profileSchema, registerSchema } from "@/lib/auth/schemas";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { useSession } from "@/stores/session";
import { useUI } from "@/stores/ui";

const pwSchema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), password: registerSchema.shape.password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

async function send(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { ok: res.ok, data: (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string>; user?: { id: string; name: string; email: string; phone: string | null } } };
}

export function ProfileForms({ user }: { user: { name: string; email: string; phone: string } }) {
  const setUser = useSession((s) => s.setUser);
  const toast = useUI((s) => s.toast);
  const [err1, setErr1] = useState<string | null>(null);
  const [err2, setErr2] = useState<string | null>(null);
  const profile = useForm<z.input<typeof profileSchema>>({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name, phone: user.phone } });
  const pw = useForm<z.input<typeof pwSchema>>({ resolver: zodResolver(pwSchema) });

  const saveProfile = profile.handleSubmit(async (v) => {
    setErr1(null);
    const { ok, data } = await send("/api/account/profile", "PATCH", v);
    if (!ok) {
      for (const [k, m] of Object.entries(data.fields ?? {})) profile.setError(k as "name", { message: m });
      return setErr1(data.error ?? "Couldn't save.");
    }
    if (data.user) setUser(data.user);
    toast({ title: "Profile updated" });
  });
  const savePw = pw.handleSubmit(async (v) => {
    setErr2(null);
    const { ok, data } = await send("/api/account/password", "POST", v);
    if (!ok) {
      for (const [k, m] of Object.entries(data.fields ?? {})) pw.setError(k as "password", { message: m });
      return setErr2(data.error ?? "Couldn't change password.");
    }
    pw.reset({ currentPassword: "", password: "", confirmPassword: "" });
    toast({ title: "Password changed", description: "Other devices have been signed out." });
  });

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={saveProfile} noValidate className="flex flex-col gap-4 rounded-[24px] bg-card p-5 sm:p-6">
        <h2 className="text-h4">Personal details</h2>
        {err1 && <p role="alert" className="text-body-sm text-danger">{err1}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" autoComplete="name" error={profile.formState.errors.name?.message} {...profile.register("name")} />
          <Input label="Mobile number" type="tel" autoComplete="tel" placeholder="01XXXXXXXXX" error={profile.formState.errors.phone?.message} {...profile.register("phone")} />
          <Input label="Email" value={user.email} readOnly disabled hint="Contact support to change your email." wrapperClassName="sm:col-span-2" />
        </div>
        <Button type="submit" className="self-start" loading={profile.formState.isSubmitting}>
          Save changes
        </Button>
      </form>
      <form onSubmit={savePw} noValidate className="flex flex-col gap-4 rounded-[24px] bg-card p-5 sm:p-6">
        <h2 className="text-h4">Change password</h2>
        {err2 && <p role="alert" className="text-body-sm text-danger">{err2}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Current password" type="password" autoComplete="current-password" error={pw.formState.errors.currentPassword?.message} wrapperClassName="sm:col-span-2" {...pw.register("currentPassword")} />
          <Input label="New password" type="password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." error={pw.formState.errors.password?.message} {...pw.register("password")} />
          <Input label="Confirm new password" type="password" autoComplete="new-password" error={pw.formState.errors.confirmPassword?.message} {...pw.register("confirmPassword")} />
        </div>
        <Button type="submit" variant="outline" className="self-start" loading={pw.formState.isSubmitting}>
          Update password
        </Button>
      </form>
    </div>
  );
}
