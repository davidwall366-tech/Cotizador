import "server-only";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/pricing";
import { isGmailConfigured, sendExpirationAlertEmail } from "@/lib/gmail";

function appUrl(): string {
  return process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/** True once `fecha + vigenciaDias` has arrived or passed, compared by calendar day. */
function isExpiringToday(fecha: Date, vigenciaDias: number): boolean {
  const expiration = new Date(fecha);
  expiration.setDate(expiration.getDate() + vigenciaDias);
  const expDateOnly = new Date(expiration.getFullYear(), expiration.getMonth(), expiration.getDate());

  const today = new Date();
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return expDateOnly.getTime() <= todayDateOnly.getTime();
}

export interface ExpirationAlertResult {
  quoteId: string;
  numero: number;
  cliente: string;
  sent: boolean;
  to?: string;
  cc?: string[];
  reason?: string;
}

/**
 * Finds quotes still `pendiente` whose vigenciaDias deadline has arrived and
 * emails the creator (cc: active admins + the client) so someone checks
 * whether the reservation deposit came in. Idempotent via
 * `alertaVencimientoEnviada` — safe to call more than once per day.
 */
export async function runExpirationAlerts(
  opts: { dryRun?: boolean } = {}
): Promise<ExpirationAlertResult[]> {
  const candidates = await prisma.quote.findMany({
    where: { estado: "pendiente", alertaVencimientoEnviada: false },
    include: { createdBy: true },
  });

  const due = candidates.filter((q) => isExpiringToday(q.fecha, q.vigenciaDias));
  if (due.length === 0) return [];

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN", active: true, email: { not: null } },
  });
  const adminEmails = admins.map((a) => a.email).filter((e): e is string => Boolean(e));

  const results: ExpirationAlertResult[] = [];

  for (const q of due) {
    const employeeEmail = q.createdBy?.email || undefined;
    // Primary recipient must be internal staff (employee, falling back to an
    // admin) — never the client alone, so someone on our side always sees it.
    const to = employeeEmail || adminEmails[0];

    if (!to) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        reason: "Sin destinatario: ni el empleado ni ningún administrador tienen correo configurado.",
      });
      continue;
    }

    const cc = Array.from(new Set([...adminEmails, q.correo].filter((e) => e && e !== to)));

    if (opts.dryRun) {
      results.push({ quoteId: q.id, numero: q.numero, cliente: q.cliente, sent: false, to, cc, reason: "dry-run" });
      continue;
    }

    if (!isGmailConfigured()) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        to,
        cc,
        reason: "Gmail no está configurado.",
      });
      continue;
    }

    try {
      await sendExpirationAlertEmail({
        to,
        cc,
        numero: q.numero,
        cliente: q.cliente,
        vigenciaDias: q.vigenciaDias,
        fechaEmision: fmtDate(q.fecha),
        quoteUrl: `${appUrl()}/cotizaciones/${q.id}`,
      });
      await prisma.quote.update({ where: { id: q.id }, data: { alertaVencimientoEnviada: true } });
      results.push({ quoteId: q.id, numero: q.numero, cliente: q.cliente, sent: true, to, cc });
    } catch (err) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        to,
        cc,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
