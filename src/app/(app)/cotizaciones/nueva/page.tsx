import QuoteForm from "@/components/quote-form/QuoteForm";
import { blankItemState, type QuoteFormState } from "@/components/quote-form/types";
import { getNextNumero } from "@/app/actions/quotes";

export default async function NuevaCotizacionPage() {
  const nextNumero = await getNextNumero();

  const initial: QuoteFormState = {
    direccion: "ida",
    cliente: "",
    correo: "",
    numero: String(nextNumero),
    fecha: new Date().toISOString().slice(0, 10),
    vigenciaDias: "7",
    vendedor: "",
    viajeN: "",
    zarpe: "",
    plazoRecepcion: "",
    notas: "",
    items: [blankItemState("vehiculo")],
  };

  return <QuoteForm mode="new" initial={initial} />;
}
