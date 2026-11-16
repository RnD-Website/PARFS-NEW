import { db } from "@/lib/db";
import { registerSchema } from "@/lib/auth/schemas";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";
import { normalisePhone } from "@/lib/utils/phone";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  if (!rateLimit(`register:${clientIp(req.headers)}`, 5, 10 * 60_000).ok) {
    return Response.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
  }
  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const { name, email, phone, password } = parsed.data;
  if (await db.user.findUnique({ where: { email } })) {
    return Response.json({ error: "An account with this email already exists.", fields: { email: "Already registered — sign in instead." } }, { status: 409 });
  }
  const user = await db.user.create({
    data: { name, email, phone: phone ? normalisePhone(phone) : null, passwordHash: await hashPassword(password) },
  });
  // Link earlier guest orders placed with the same email.
  await db.order.updateMany({ where: { email, userId: null }, data: { userId: user.id } });
  await createSession(user.id);
  await sendEmail({ to: email, subject: "Welcome to PARFS", text: `Hi ${name},\n\nYour PARFS account is ready. Save your wishlist, check out faster and follow your orders.\n\n— PARFS` });
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } }, { status: 201 });
}
