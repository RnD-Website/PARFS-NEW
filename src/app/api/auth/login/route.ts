import { db } from "@/lib/db";
import { loginSchema } from "@/lib/auth/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

// Used to keep response time similar whether or not the email exists.
const DUMMY_HASH = "$2b$12$6WclupNmWnBmN4OnU0wCpOqrLyCM2tXQc.XgELpUyBW8BRU7Azih.";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const { email, password } = parsed.data;
  if (!rateLimit(`login:${clientIp(req.headers)}:${email}`, 8, 15 * 60_000).ok) {
    return Response.json({ error: "Too many sign-in attempts. Please wait a few minutes." }, { status: 429 });
  }
  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
}
