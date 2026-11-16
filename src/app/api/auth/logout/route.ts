import { destroySession } from "@/lib/auth/session";
import { checkMutation } from "@/lib/security/request";

export async function POST(req: Request) {
  const bad = checkMutation(req);
  if (bad) return bad;
  await destroySession();
  return Response.json({ ok: true });
}
