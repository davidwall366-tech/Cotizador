"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderQuotePdf } from "@/lib/pdf";
import { isDropboxConfigured, uploadQuotePdf } from "@/lib/dropbox";
import { isGmailConfigured, sendQuoteEmail } from "@/lib/gmail";

export async function getIntegrationStatus() {
  return { dropbox: isDropboxConfigured(), gmail: isGmailConfigured() };
}

async function requireSessionAndQuote(quoteId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
  if (!quote) throw new Error("Cotización no encontrada.");

  return { session, quote };
}

export async function exportQuoteToDropbox(quoteId: string): Promise<{ path: string }> {
  const { quote } = await requireSessionAndQuote(quoteId);
  const pdf = await renderQuotePdf(quoteId);
  return uploadQuotePdf(quote, pdf);
}

/**
 * Best-effort background export used right after a quote is saved (see
 * quotes.ts, scheduled via next/server's `after`). Never throws — a failed
 * or unconfigured Dropbox export must not block saving a quote.
 *
 * Opt-in: only runs when DROPBOX_AUTO_EXPORT=1. Otherwise employees export
 * on demand with the "Guardar en Dropbox" button, so saves never silently
 * write to the shared team folder.
 */
export async function autoExportQuoteToDropbox(quoteId: string): Promise<void> {
  if (process.env.DROPBOX_AUTO_EXPORT !== "1") return;
  if (!isDropboxConfigured()) return;
  try {
    const quote = await prisma.quote.findUnique({ where: { id: quoteId } });
    if (!quote) return;
    const pdf = await renderQuotePdf(quoteId);
    await uploadQuotePdf(quote, pdf);
  } catch (err) {
    console.error("[dropbox] auto-export failed for quote", quoteId, err);
  }
}

export async function sendQuoteByEmail(
  quoteId: string,
  opts: { ccMe?: boolean } = {}
): Promise<void> {
  const { session, quote } = await requireSessionAndQuote(quoteId);
  const pdf = await renderQuotePdf(quoteId);

  let cc: string | undefined;
  if (opts.ccMe) {
    const me = await prisma.user.findUnique({ where: { id: session.user.id } });
    cc = me?.email || undefined;
  }

  await sendQuoteEmail({
    to: quote.correo,
    cc,
    numero: quote.numero,
    cliente: quote.cliente,
    vendedor: quote.vendedor || "Naviera GV",
    pdf,
  });
}
