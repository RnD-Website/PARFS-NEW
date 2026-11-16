/** Normalises Bangladeshi mobile numbers to 01XXXXXXXXX. */
export function normalisePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("880")) return `0${digits.slice(3)}`;
  return digits;
}
