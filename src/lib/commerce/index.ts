import "server-only";
import type { CommerceProvider } from "./provider";
import { prismaCommerce } from "./adapters/prisma";

/**
 * The active catalogue backend. Switch with COMMERCE_PROVIDER once another adapter
 * (e.g. Shopify) is implemented — no page or component changes are needed.
 */
function resolveProvider(): CommerceProvider {
  switch (process.env.COMMERCE_PROVIDER ?? "prisma") {
    case "prisma":
    case "local":
      return prismaCommerce;
    default:
      throw new Error(`Unknown COMMERCE_PROVIDER "${process.env.COMMERCE_PROVIDER}"`);
  }
}

export const commerce = resolveProvider();
export { toSummary } from "./adapters/prisma";
export * from "./types";
