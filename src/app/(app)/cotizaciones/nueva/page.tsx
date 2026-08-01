import QuoteForm from "@/components/quote-form/QuoteForm";
import { blankItemState, type QuoteFormState } from "@/components/quote-form/types";
import { getNextNumero } from "@/app/actions/quotes";
import { auth } from "@/auth";

export default async function NuevaCotizacionPage() {
  const [nextNumero, session] = await Promise.all([getNextNumero(), auth()]);

  const initial: QuoteFormState = {
    direccion: "ida",
    cliente: "",
    correo: "",
    numero: String(nextNumero),
    fecha: new Date().toISOString().slice(0, 10),
    vigenciaDias: "7",
    vendedor: session?.user?.name || "",
    viajeN: "",
    zarpe: "",
    plazoRecepcion: "",
    notas: "",
    items: [blankItemState("vehiculo")],
  };

  return <QuoteForm mode="new" initial={initial} />;
}
