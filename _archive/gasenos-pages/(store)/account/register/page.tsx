import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { RegisterForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <AuthShell eyebrow="JOIN GASENOS" title="Create your account" subtitle="Faster checkout, order tracking and a wishlist that follows you.">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
