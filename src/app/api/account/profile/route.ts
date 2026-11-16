import { db } from "@/lib/db";
import { profileSchema } from "@/lib/auth/schemas";
import { getCurrentUser } from "@/lib/auth/session";
import { checkMutation, fieldErrors, readJson } from "@/lib/security/request";
import { normalisePhone } from "@/lib/utils/phone";

export async function PATCH(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Please sign in." }, { status: 401 });
  const parsed = profileSchema.safeParse(await readJson(req));
  if (!parsed.success) return Response.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error.issues) }, { status: 400 });
  const updated = await db.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ? normalisePhone(parsed.data.phone) : null },
  });
  return Response.json({ user: { id: updated.id, name: updated.name, email: updated.email, phone: updated.phone } });
}
