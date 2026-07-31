import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildQuoteDocumentViewModel } from "@/lib/quote-view";
import { verifyQuoteToken } from "@/lib/pdf-token";
import QuoteDocument from "@/components/QuoteDocument";

// Standalone, unauthenticated-by-session print view used only by the internal
// PDF renderer (see lib/pdf.ts). Access is gated by a short-lived signed
// token instead of a login session, since the headless browser has no
// cookies. Never link to this route from the UI.
export default async function ImprimirCotizacionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  if (!verifyQuoteToken(id, token)) notFound();

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: { include: { vehiculos: true } } },
  });
  if (!quote) notFound();

  const vm = buildQuoteDocumentViewModel(quote);

  return (
    <div className="p-5 flex justify-center">
      <QuoteDocument vm={vm} />
    </div>
  );
}
