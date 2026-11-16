import { requireUser } from "@/lib/auth/guard";
import { AccountNav } from "@/components/account/account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/account");
  return (
    <div className="container-page pt-8 pb-16 lg:pt-12 lg:pb-24">
      <p className="text-eyebrow text-orange-text">( MY ACCOUNT )</p>
      <h1 className="mt-3 text-h1">Hi, {user.name.split(" ")[0]}</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-12">
        <AccountNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
