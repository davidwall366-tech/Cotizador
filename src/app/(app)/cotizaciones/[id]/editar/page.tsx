import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import QuoteForm from "@/components/quote-form/QuoteForm";
import { dbToFormState } from "@/components/quote-form/convert";
import { auth } from "@/auth";

export default async function EditarCotizacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [quote, session] = await Promise.all([
    prisma.quote.findUnique({ where: { id }, include: { items: { include: { vehiculos: true } } } }),
    auth(),
  ]);
  if (!quote) notFound();

  const initial = dbToFormState(quote);
  initial.vendedor = session?.user?.name || initial.vendedor;

  return <QuoteForm mode="edit" quoteId={quote.id} initial={initial} />;
}
