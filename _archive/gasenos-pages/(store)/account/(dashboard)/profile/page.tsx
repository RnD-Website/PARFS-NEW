import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/guard";
import { ProfileForms } from "@/components/account/profile-forms";

export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const user = await requireUser("/account/profile");
  return <ProfileForms user={{ name: user.name, email: user.email, phone: user.phone ?? "" }} />;
}
