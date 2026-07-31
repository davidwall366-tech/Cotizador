import "server-only";
import { Dropbox } from "dropbox";

/**
 * Naming convention (see README.md § Integrations to build):
 *   /{DROPBOX_ROOT_FOLDER}/{año}/{numero}-{cliente}.pdf
 * Confirm this with the client before relying on it in production — it's a
 * reasonable default, not a signed-off requirement.
 */
export function isDropboxConfigured(): boolean {
  return Boolean(
    process.env.DROPBOX_APP_KEY && process.env.DROPBOX_APP_SECRET && process.env.DROPBOX_REFRESH_TOKEN
  );
}

function getClient(): Dropbox {
  return new Dropbox({
    clientId: process.env.DROPBOX_APP_KEY,
    clientSecret: process.env.DROPBOX_APP_SECRET,
    refreshToken: process.env.DROPBOX_REFRESH_TOKEN,
  });
}

function sanitizeForPath(s: string): string {
  // Strip filesystem-illegal chars and any trailing dots/spaces so a client
  // name like "Comercial Rapa Nui Ltda." doesn't yield "...Ltda..pdf".
  return s.replace(/[\\/:*?"<>|]/g, "").replace(/[.\s]+$/, "").trim() || "cliente";
}

export function quoteDropboxPath(quote: { numero: number; cliente: string; fecha: Date }): string {
  // Defined-but-empty means "app-folder root"; undefined falls back to /Cotizaciones.
  const rawRoot = process.env.DROPBOX_ROOT_FOLDER;
  const root = (rawRoot === undefined ? "/Cotizaciones" : rawRoot).replace(/\/+$/, "");
  const anio = quote.fecha.getFullYear();
  return `${root}/${anio}/${quote.numero}-${sanitizeForPath(quote.cliente)}.pdf`;
}

export async function uploadQuotePdf(
  quote: { numero: number; cliente: string; fecha: Date },
  pdf: Buffer
): Promise<{ path: string }> {
  if (!isDropboxConfigured()) {
    throw new Error(
      "Dropbox no está configurado (faltan DROPBOX_APP_KEY / DROPBOX_APP_SECRET / DROPBOX_REFRESH_TOKEN)."
    );
  }

  const dbx = getClient();
  const path = quoteDropboxPath(quote);
  await dbx.filesUpload({
    path,
    contents: pdf,
    mode: { ".tag": "overwrite" },
    mute: true,
  });

  return { path };
}
