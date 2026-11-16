import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/account/auth-shell";
import { ResetForm } from "@/components/account/auth-forms";

export const metadata: Metadata = { title: "Set a new password", robots: { index: false } };

export default async function ResetPage({ searchParams }: PageProps<"/account/reset-password">) {
  const token = (await searchParams).token;
  return (
    <AuthShell eyebrow="ACCOUNT HELP" title="Set a new password">
      {typeof token === "string" && token.length > 10 ? (
        <ResetForm token={token} />
      ) : (
        <p className="text-body text-ink-muted">
          This link is missing its token.{" "}
          <Link href="/account/forgot-password" className="font-semibold text-ink underline">
            Request a new reset link
          </Link>
          .
        </p>
      )}
    </AuthShell>
  );
}
