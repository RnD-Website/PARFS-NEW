import "server-only";
import type { AIProvider } from "./types";
import { parfsMockProvider } from "./parfs/mock";
import { parfsClaudeProvider } from "./parfs/claude";

/**
 * The PARFS Concierge. AI_PROVIDER=mock (default — built-in advisor, no key needed) | anthropic
 * (Claude; needs ANTHROPIC_API_KEY or another credential the Anthropic SDK resolves).
 * (The original GASENOS assistant providers remain in ./providers but are no longer used.)
 */
export function getAIProvider(): AIProvider {
  if (process.env.AI_PROVIDER === "anthropic") {
    if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) {
      console.warn("[ai] AI_PROVIDER=anthropic but no ANTHROPIC_API_KEY set — falling back to the built-in concierge");
      return parfsMockProvider;
    }
    return parfsClaudeProvider;
  }
  return parfsMockProvider;
}
export type * from "./types";
