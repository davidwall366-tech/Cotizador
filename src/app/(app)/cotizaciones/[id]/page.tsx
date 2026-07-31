import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildQuoteDocumentViewModel } from "@/lib/quote-view";
import { getIntegrationStatus } from "@/app/actions/integrations";
import DocumentActions from "@/components/DocumentActions";
import QuoteDocument from "@/components/QuoteDocument";
import IntegrationActions from "@/components/IntegrationActions";

// The Dropbox/Gmail server actions invoked from this page render a PDF with
// headless Chromium, so this route needs more than the default 10s budget.
export const maxDuration = 60;

export default async function CotizacionDocumentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: { items: { include: { vehiculos: true } } },
  });
  if (!quote) notFound();

  const vm = buildQuoteDocumentViewModel(quote);
  const integrations = await getIntegrationStatus();

  return (
    <div className="flex-1 px-5 py-8 pb-[60px] flex flex-col items-center">
      <DocumentActions quoteId={quote.id} />
      <QuoteDocument vm={vm} />
      <IntegrationActions
        quoteId={quote.id}
        dropboxEnabled={integrations.dropbox}
        gmailEnabled={integrations.gmail}
      />
    </div>
  );
}
