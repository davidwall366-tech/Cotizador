import "server-only";
import nodemailer from "nodemailer";

export function isGmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

function getTransport() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export interface SendQuoteEmailInput {
  to: string;
  cc?: string;
  numero: number;
  cliente: string;
  vendedor: string;
  pdf: Buffer;
}

export async function sendQuoteEmail(input: SendQuoteEmailInput): Promise<void> {
  if (!isGmailConfigured()) {
    throw new Error("Gmail no está configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD).");
  }

  const transport = getTransport();
  await transport.sendMail({
    from: `"Naviera GV" <${process.env.GMAIL_USER}>`,
    to: input.to,
    cc: input.cc,
    subject: `Cotización N° ${input.numero} — Naviera GV`,
    text:
      `Estimado/a ${input.cliente},\n\n` +
      `Junto con saludarle, adjunto la cotización N° ${input.numero} solicitada.\n\n` +
      `Quedamos atentos a sus comentarios.\n\n` +
      `Atentamente,\n${input.vendedor}\n` +
      `Naviera GV S.A. · +56 32 239 1749`,
    attachments: [
      {
        filename: `cotizacion-${input.numero}.pdf`,
        content: input.pdf,
        contentType: "application/pdf",
      },
    ],
  });
}
