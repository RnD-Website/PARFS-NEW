import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";

/** Use in account pages: returns the user or redirects to login with a return path. */
export async function requireUser(returnTo = "/account") {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}
