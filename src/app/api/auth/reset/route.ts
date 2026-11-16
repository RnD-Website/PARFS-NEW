import { db } from "@/lib/db";
import { resetSchema } from "@/lib/auth/schemas";
import { hashToken, createSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const parsed = resetSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const record = await db.passwordResetToken.findUnique({ where: { tokenHash: hashToken(parsed.data.token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return Response.json({ error: "This reset link is invalid or has expired. Request a new one." }, { status: 400 });
  }
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  await createSession(record.userId);
  return Response.json({ ok: true });
}
