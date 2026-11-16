import type { Metadata } from "next";
import { AuthShell } from "@/components/account/auth-shell";
import { ForgotForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell eyebrow="ACCOUNT HELP" title="Reset your password" subtitle="Enter your email and we’ll send you a reset link.">
      <ForgotForm />
    </AuthShell>
  );
}
