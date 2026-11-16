import "server-only";

/**
 * Basic CSRF defence for cookie-authenticated JSON endpoints: require a JSON body
 * (cross-site HTML forms can't send it) and, when the browser sends Origin, require
 * it to match the host.
 */
export function checkMutation(req: Request): Response | null {
  const ct = req.headers.get("content-type") ?? "";
  if (!ct.includes("application/json")) return Response.json({ error: "Unsupported content type" }, { status: 415 });
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      if (new URL(origin).host !== host) return Response.json({ error: "Forbidden" }, { status: 403 });
    } catch {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }
  return null;
}

export async function readJson(req: Request) {
  return req.json().catch(() => null);
}

export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const k = String(i.path[0] ?? "form");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
