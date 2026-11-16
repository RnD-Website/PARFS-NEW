import { db } from "@/lib/db";
import { newsletterSchema } from "@/lib/marketing/schemas";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  if (!rateLimit(`nl:${clientIp(req.headers)}`, 5, 60_000).ok) {
    return Response.json({ error: "Too many attempts — please try again shortly." }, { status: 429 });
  }
  const parsed = newsletterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  const { email, name, consent } = parsed.data;
  const existing = await db.newsletterSubscriber.findUnique({ where: { email } });
  if (existing) return Response.json({ message: "You're already on the list — thanks!" });
  await db.newsletterSubscriber.create({ data: { email, name: name || null, consent } });
  await sendEmail({
    to: email,
    subject: "Welcome to the Maison — PARFS",
    text: `Hi${name ? ` ${name}` : ""},\n\nThank you for subscribing to the Maison. You'll be the first to discover new creations, private launches and rituals from PARFS.\n\n— PARFS`,
  });
  return Response.json({ message: "You're on the list!" }, { status: 201 });
}
