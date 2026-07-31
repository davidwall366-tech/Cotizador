import crypto from "crypto";

const TOKEN_TTL_MS = 60_000;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET no está configurado.");
  return s;
}

/** Short-lived token authorizing the headless-browser render of one quote's print view. */
export function signQuoteToken(quoteId: string): string {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = `${quoteId}.${expires}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  return `${expires}.${sig}`;
}

export function verifyQuoteToken(quoteId: string, token: string | null | undefined): boolean {
  if (!token) return false;
  const [expiresStr, sig] = token.split(".");
  const expires = Number(expiresStr);
  if (!expires || !sig || Date.now() > expires) return false;

  const payload = `${quoteId}.${expires}`;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
