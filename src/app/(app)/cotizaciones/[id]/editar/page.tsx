import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/quote-form/QuoteForm";
import { dbToFormState } from "@/components/quote-form/convert";

export default async function EditarCotizacionPage({
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

  return <QuoteForm mode="edit" quoteId={quote.id} initial={dbToFormState(quote)} />;
}
