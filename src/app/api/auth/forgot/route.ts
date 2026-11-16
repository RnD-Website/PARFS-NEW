import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { forgotSchema } from "@/lib/auth/schemas";
import { hashToken } from "@/lib/auth/session";
import { checkMutation, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";
import { site } from "@/content/site";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  if (!rateLimit(`forgot:${clientIp(req.headers)}`, 5, 15 * 60_000).ok) {
    return Response.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }
  const parsed = forgotSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (user) {
    const token = randomBytes(32).toString("base64url");
    await db.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const link = `${site.url}/account/reset-password?token=${token}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your GASENOS password",
      text: `Hi ${user.name},\n\nReset your password using this link (valid for 1 hour):\n${link}\n\nIf you didn't ask for this, you can ignore this email.`,
    });
  }
  // Same response either way so emails can't be enumerated.
  return Response.json({ message: "If an account exists for that email, we've sent a reset link." });
}
