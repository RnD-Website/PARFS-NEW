import { db } from "@/lib/db";
import { contactSchema } from "@/lib/marketing/schemas";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  if (!rateLimit(`contact:${clientIp(req.headers)}`, 5, 10 * 60_000).ok) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  const parsed = contactSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const msg = await db.contactMessage.create({ data: { ...parsed.data, phone: parsed.data.phone || null } });
  if (process.env.SUPPORT_EMAIL) {
    await sendEmail({ to: process.env.SUPPORT_EMAIL, subject: `[Contact] ${msg.subject}`, text: `From: ${msg.name} <${msg.email}> ${msg.phone ?? ""}\n\n${msg.message}` });
  }
  return Response.json({ ok: true }, { status: 201 });
}
