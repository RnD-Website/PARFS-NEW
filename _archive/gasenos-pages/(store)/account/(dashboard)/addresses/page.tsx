import type { Metadata } from "next";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guard";
import { AddressManager } from "@/components/account/address-manager";

export const metadata: Metadata = { title: "Addresses", robots: { index: false } };

export default async function AddressesPage() {
  const user = await requireUser("/account/addresses");
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return <AddressManager initial={addresses.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))} />;
}
