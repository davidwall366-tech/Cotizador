"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderQuotePdf } from "@/lib/pdf";
import { isDropboxConfigured, uploadQuotePdf } from "@/lib/dropbox";
import { isGmailConfigured, sendQuoteEmail } from "@/lib/gmail";

export async function getIntegrationStatus() {
  return { dropbox: isDropboxConfigured(), gmail: isGmailConfigured() };
}

/**
 * Automatic export run right after every quote is created or updated (see
 * quotes.ts, scheduled via next/server's `after`) — no button, no prompt.
 * Never throws — a failed or unconfigured Dropbox export must not block
 * saving a quote. Gated behind DROPBOX_AUTO_EXPORT=1 as a kill switch.
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

export async function sendQuoteByEmail(quoteId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { createdBy: true },
  });
  if (!quote) throw new Error("Cotización no encontrada.");

  const pdf = await renderQuotePdf(quoteId);

  // Always cc whoever created the quote, so they keep a record of what was
  // sent — no opt-in checkbox needed.
  const cc = quote.createdBy?.email || undefined;

  await sendQuoteEmail({
    to: quote.correo,
    cc,
    numero: quote.numero,
    cliente: quote.cliente,
    vendedor: quote.vendedor || "Naviera GV",
    pdf,
  });
}
