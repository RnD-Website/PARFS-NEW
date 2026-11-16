import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Signed token that lets a guest view their own order confirmation/tracking page. */
const secret = () => {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET is not set");
  return s ?? "dev-only-secret";
};

export function orderToken(orderNumber: string) {
  return createHmac("sha256", secret()).update(`order:${orderNumber}`).digest("base64url").slice(0, 32);
}

export function verifyOrderToken(orderNumber: string, token: string | undefined | null) {
  if (!token) return false;
  const expected = Buffer.from(orderToken(orderNumber));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
