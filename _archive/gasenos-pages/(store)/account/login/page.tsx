import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/account/auth-shell";
import { LoginForm } from "@/components/account/auth-forms";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <AuthShell eyebrow="WELCOME BACK" title="Sign in" subtitle="Track orders, save addresses and keep your wishlist everywhere.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
