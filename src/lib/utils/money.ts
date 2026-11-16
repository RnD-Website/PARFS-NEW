/**
 * Money is always stored in minor units (poisha for BDT, cents for USD).
 * Formatting is centralised here so new markets only need a new entry.
 */
export type CurrencyCode = "BDT" | "USD";

const CURRENCIES: Record<CurrencyCode, { symbol: string; locale: string; minorUnits: number }> = {
  // en-IN grouping matches Bangladeshi lakh/crore grouping (1,54,800).
  BDT: { symbol: "৳", locale: "en-IN", minorUnits: 100 },
  USD: { symbol: "$", locale: "en-US", minorUnits: 100 },
};

export const DEFAULT_CURRENCY: CurrencyCode = "BDT";

export function toMinor(major: number, currency: CurrencyCode = DEFAULT_CURRENCY) {
  return Math.round(major * CURRENCIES[currency].minorUnits);
}

export function toMajor(minor: number, currency: CurrencyCode = DEFAULT_CURRENCY) {
  return minor / CURRENCIES[currency].minorUnits;
}

export function formatMoney(minor: number, currency: string = DEFAULT_CURRENCY) {
  const c = CURRENCIES[(currency as CurrencyCode) in CURRENCIES ? (currency as CurrencyCode) : DEFAULT_CURRENCY];
  const major = minor / c.minorUnits;
  const hasFraction = Math.round(major * 100) % 100 !== 0;
  const formatted = major.toLocaleString(c.locale, {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${c.symbol}${formatted}`;
}

export function discountPercent(price: number, compareAt?: number | null) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}
