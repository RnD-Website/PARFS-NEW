import { z } from "zod";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { normalisePhone } from "@/lib/utils/phone";

const clean = (d: z.infer<typeof addressSchema>) => ({
  label: d.label || null,
  fullName: d.fullName,
  phone: normalisePhone(d.phone),
  line1: d.line1,
  line2: d.line2 || null,
  area: d.area || null,
  city: d.city,
  district: d.district,
  postalCode: d.postalCode || null,
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ addresses: [] });
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
  return Response.json({ addresses });
}

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const parsed = addressSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const count = await db.address.count({ where: { userId: user.id } });
  if (count >= 10) return Response.json({ error: "You can save up to 10 addresses." }, { status: 400 });
  const isDefault = parsed.data.isDefault || count === 0;
  if (isDefault) await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  const address = await db.address.create({ data: { ...clean(parsed.data), isDefault, userId: user.id } });
  return Response.json({ address }, { status: 201 });
}

export async function PATCH(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const body = await readJson(req);
  const id = z.string().min(1).safeParse(body?.id);
  const parsed = addressSchema.safeParse(body);
  if (!id.success || !parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: parsed.success ? {} : fieldErrors(parsed.error.issues) }, { status: 400 });
  const existing = await db.address.findFirst({ where: { id: id.data, userId: user.id } });
  if (!existing) return Response.json({ error: "Address not found." }, { status: 404 });
  if (parsed.data.isDefault) await db.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
  const address = await db.address.update({ where: { id: existing.id }, data: { ...clean(parsed.data), isDefault: parsed.data.isDefault ?? existing.isDefault } });
  return Response.json({ address });
}

export async function DELETE(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const id = z.string().min(1).safeParse((await readJson(req))?.id);
  if (!id.success) return Response.json({ error: "Invalid address" }, { status: 400 });
  const existing = await db.address.findFirst({ where: { id: id.data, userId: user.id } });
  if (!existing) return Response.json({ error: "Address not found." }, { status: 404 });
  await db.address.delete({ where: { id: existing.id } });
  if (existing.isDefault) {
    const next = await db.address.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
    if (next) await db.address.update({ where: { id: next.id }, data: { isDefault: true } });
  }
  return Response.json({ ok: true });
}
