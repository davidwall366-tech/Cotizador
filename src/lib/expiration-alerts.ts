import "server-only";
import { prisma } from "@/lib/prisma";
import { fmtDate } from "@/lib/pricing";
import { isGmailConfigured, sendExpirationAlertEmail, sendExpirationClientNoticeEmail } from "@/lib/gmail";
import { ccAdminsAndCreator } from "@/lib/notify-cc";

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
  clienteTo?: string;
  clienteCc?: string[];
  internoTo?: string;
  internoCc?: string[];
  reason?: string;
}

/**
 * Finds quotes still `pendiente` whose vigenciaDias deadline has arrived and
 * sends two separate emails: a plain heads-up to the client (no internal
 * instructions), and an internal one to the creator (cc: active admins)
 * asking them to check whether the deposit came in. The client must never
 * see the internal email's content — that was a real bug this fixes:
 * the client used to be cc'd on the staff-facing email verbatim. Idempotent
 * via `alertaVencimientoEnviada` — safe to call more than once per day.
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
    // Internal notice goes to the employee who created the quote, falling
    // back to an admin — the client is never on this email, only the plain
    // client-facing notice below.
    const internoTo = employeeEmail || adminEmails[0];
    const internoCc = internoTo ? Array.from(new Set(adminEmails.filter((e) => e !== internoTo))) : undefined;
    const clienteCc = await ccAdminsAndCreator(q);

    if (opts.dryRun) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        clienteTo: q.correo,
        clienteCc,
        internoTo,
        internoCc,
        reason: "dry-run",
      });
      continue;
    }

    if (!isGmailConfigured()) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        clienteTo: q.correo,
        clienteCc,
        internoTo,
        internoCc,
        reason: "Gmail no está configurado.",
      });
      continue;
    }

    try {
      await sendExpirationClientNoticeEmail({
        to: q.correo,
        cc: clienteCc,
        numero: q.numero,
        cliente: q.cliente,
        vigenciaDias: q.vigenciaDias,
      });

      if (internoTo) {
        // Best-effort: the client notice above is what matters most here,
        // so a failure notifying staff must not undo it or block marking
        // alertaVencimientoEnviada.
        try {
          await sendExpirationAlertEmail({
            to: internoTo,
            cc: internoCc,
            numero: q.numero,
            cliente: q.cliente,
            vigenciaDias: q.vigenciaDias,
            fechaEmision: fmtDate(q.fecha),
            quoteUrl: `${appUrl()}/cotizaciones/${q.id}`,
          });
        } catch (err) {
          console.error("[expiration-alerts] internal notice failed for quote", q.id, err);
        }
      }

      await prisma.quote.update({ where: { id: q.id }, data: { alertaVencimientoEnviada: true } });
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: true,
        clienteTo: q.correo,
        clienteCc,
        internoTo,
        internoCc,
      });
    } catch (err) {
      results.push({
        quoteId: q.id,
        numero: q.numero,
        cliente: q.cliente,
        sent: false,
        clienteTo: q.correo,
        clienteCc,
        internoTo,
        internoCc,
        reason: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
