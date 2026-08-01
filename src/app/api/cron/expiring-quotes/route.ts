import { NextResponse } from "next/server";
import { runExpirationAlerts } from "@/lib/expiration-alerts";

// Sends real email — give it room beyond the default 10s serverless budget.
export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Triggered daily by Vercel Cron (see vercel.json), which sends
 * `Authorization: Bearer $CRON_SECRET`. Also callable manually with
 * `?secret=$CRON_SECRET` for ops, or `?dryRun=1` (no secret needed — it only
 * reports what would be sent, never sends or mutates anything).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";

  if (!dryRun) {
    const secret = process.env.CRON_SECRET;
    const authHeader = req.headers.get("authorization");
    const isCronRequest = Boolean(secret) && authHeader === `Bearer ${secret}`;
    const isManualRequest = Boolean(secret) && url.searchParams.get("secret") === secret;
    if (!isCronRequest && !isManualRequest) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }
  }

  const results = await runExpirationAlerts({ dryRun });
  return NextResponse.json({ dryRun, count: results.length, results });
}
