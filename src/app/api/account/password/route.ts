import { z } from "zod";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/auth/schemas";
import { getCurrentUser, createSession } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";

const schema = z
  .object({ currentPassword: z.string().min(1, "Enter your current password"), password: registerSchema.shape.password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords don't match" });

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const full = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  if (!(await verifyPassword(parsed.data.currentPassword, full.passwordHash))) {
    return Response.json({ error: "Current password is incorrect.", fields: { currentPassword: "Incorrect password" } }, { status: 400 });
  }
  await db.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.password) } });
  // Sign out other devices.
  await db.session.deleteMany({ where: { userId: user.id } });
  await createSession(user.id);
  return Response.json({ ok: true });
}
