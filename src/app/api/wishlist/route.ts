import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

const one = z.object({ productId: z.string().min(1).max(64) });
const many = z.object({ productIds: z.array(z.string().min(1).max(64)).max(200) });

async function list(userId: string) {
  const rows = await db.wishlistItem.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { productId: true } });
  return rows.map((r) => r.productId);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ productIds: [] });
  return Response.json({ productIds: await list(user.id) });
}

/** Merge a guest wishlist into the account and return the combined list. */
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const parsed = many.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const valid = await db.product.findMany({ where: { id: { in: parsed.data.productIds } }, select: { id: true } });
  if (valid.length) {
    await db.wishlistItem.createMany({ data: valid.map((p) => ({ userId: user.id, productId: p.id })), skipDuplicates: true });
  }
  return Response.json({ productIds: await list(user.id) });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const parsed = one.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  const exists = await db.product.findUnique({ where: { id: parsed.data.productId }, select: { id: true } });
  if (!exists) return Response.json({ error: "Unknown product" }, { status: 404 });
  await db.wishlistItem.upsert({
    where: { userId_productId: { userId: user.id, productId: parsed.data.productId } },
    update: {},
    create: { userId: user.id, productId: parsed.data.productId },
  });
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Not signed in" }, { status: 401 });
  const parsed = one.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid input" }, { status: 400 });
  await db.wishlistItem.deleteMany({ where: { userId: user.id, productId: parsed.data.productId } });
  return Response.json({ ok: true });
}
