/**
 * Formats a Chilean RUT as the user types: strips everything but digits and
 * the trailing verification digit (0-9 or K), then re-inserts thousands dots
 * and the dash — e.g. "109633909" -> "10.963.390-9". Idempotent, so it's also
 * safe to apply when rendering an already-formatted or legacy unformatted
 * value on the printed quote.
 */
export function formatRut(raw: string): string {
  const clean = raw.replace(/[^0-9kK]/g, "").toUpperCase();
  if (!clean) return "";

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!body) return dv;

  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}
