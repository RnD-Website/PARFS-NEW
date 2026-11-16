"use client";

import { DialRoot } from "dialkit";
import "dialkit/styles.css";

/**
 * DialKit — live tuning panel for the PARFS animations (hero slideshow, ingredient carousel, …).
 * Components register their own panels with `useDialKit`; this root displays them.
 * DialKit hides the root in production builds, so it only appears in `next dev`.
 */
export function ParfsDialRoot() {
  return <DialRoot position="bottom-right" theme="dark" defaultOpen={false} />;
}
