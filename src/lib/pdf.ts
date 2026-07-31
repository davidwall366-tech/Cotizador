import "server-only";
import type { Browser } from "puppeteer-core";
import { signQuoteToken } from "@/lib/pdf-token";

function appUrl(): string {
  return process.env.APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
}

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = await import("puppeteer-core");
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Local dev: use full `puppeteer`, which bundles a Chromium build for the
  // current OS. Not installed in production — only imported here.
  const puppeteer = (await import("puppeteer")).default;
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
  });
  return browser as unknown as Browser;
}

/** Renders a quote's formal document to a PDF buffer via a headless browser. */
export async function renderQuotePdf(quoteId: string): Promise<Buffer> {
  const token = signQuoteToken(quoteId);
  const url = `${appUrl()}/imprimir/${quoteId}?token=${encodeURIComponent(token)}`;

  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // "load" (not "networkidle0"): in Next.js dev mode the HMR client keeps a
    // persistent WebSocket open, which networkidle0 would wait on until it
    // times out. The document is fully server-rendered, so "load" is enough.
    await page.goto(url, { waitUntil: "load" });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "24px", bottom: "24px", left: "24px", right: "24px" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
