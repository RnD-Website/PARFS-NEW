import "server-only";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyOrderToken } from "./access";

/** Loads an order only for its owner (signed in) or holder of the signed link token. */
export async function getOrderForViewer(orderNumber: string, token?: string | null) {
  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });
  if (!order) return null;
  const user = await getCurrentUser();
  if ((user && order.userId === user.id) || verifyOrderToken(order.orderNumber, token)) return order;
  return null;
}
