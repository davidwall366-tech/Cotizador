import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { renderQuotePdf } from "@/lib/pdf";

// PDF rendering launches headless Chromium — needs the Node runtime and more
// than the default 10s function budget on serverless (Vercel).
export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  const { id } = await params;
  const quote = await prisma.quote.findUnique({ where: { id } });
  if (!quote) {
    return NextResponse.json({ error: "Cotización no encontrada." }, { status: 404 });
  }

  const pdf = await renderQuotePdf(id);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="cotizacion-${quote.numero}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
