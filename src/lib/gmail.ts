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
  cc?: string[];
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
    cc: input.cc?.length ? input.cc : undefined,
    subject: `Cotización N° ${input.numero} — Naviera GV`,
    text:
      `Estimado/a ${input.cliente},\n\n` +
      `Junto con saludarle, adjunto la cotización N° ${input.numero} solicitada.\n\n` +
      `Quedamos atentos a sus comentarios.\n\n` +
      `Atentamente,\n${input.vendedor}\n` +
      `Naviera GV S.A. · +56 9 7512 4982`,
    attachments: [
      {
        filename: `cotizacion-${input.numero}.pdf`,
        content: input.pdf,
        contentType: "application/pdf",
      },
    ],
  });
}

export interface SendExpirationAlertInput {
  to: string;
  cc?: string[];
  numero: number;
  cliente: string;
  vigenciaDias: number;
  fechaEmision: string;
  quoteUrl: string;
}

export async function sendExpirationAlertEmail(input: SendExpirationAlertInput): Promise<void> {
  if (!isGmailConfigured()) {
    throw new Error("Gmail no está configurado (faltan GMAIL_USER / GMAIL_APP_PASSWORD).");
  }

  const transport = getTransport();
  await transport.sendMail({
    from: `"Naviera GV" <${process.env.GMAIL_USER}>`,
    to: input.to,
    cc: input.cc?.length ? input.cc : undefined,
    subject: `Cotización N° ${input.numero} — vencimiento del plazo de reserva`,
    text:
      `Estimados,\n\n` +
      `La cotización N° ${input.numero} para ${input.cliente}, emitida el ${input.fechaEmision}, ` +
      `cumple hoy los ${input.vigenciaDias} días de vigencia para el abono de reserva y ` +
      `aún figura como Pendiente en el sistema.\n\n` +
      `Si el cliente ya realizó el abono, por favor actualicen el estado de la cotización a ` +
      `"Aprobada" en el Cotizador. Si no se recibe el abono, la cotización se considerará caducada.\n\n` +
      `Pueden revisar el detalle aquí: ${input.quoteUrl}\n\n` +
      `Este es un aviso automático del Cotizador Naviera GV.`,
  });
}
