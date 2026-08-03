import QuoteForm from "@/components/quote-form/QuoteForm";
import { blankItemState, type QuoteFormState } from "@/components/quote-form/types";
import { getNextNumero } from "@/app/actions/quotes";
import { getTarifas } from "@/lib/tarifas";
import { auth } from "@/auth";

export default async function NuevaCotizacionPage() {
  const [nextNumero, session, tarifas] = await Promise.all([getNextNumero(), auth(), getTarifas()]);

  const initial: QuoteFormState = {
    direccion: "ida",
    cliente: "",
    clienteRut: "",
    mostrarRut: false,
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

  return (
    <QuoteForm
      mode="new"
      initial={initial}
      isAdmin={session?.user?.role === "ADMIN"}
      tarifas={tarifas}
    />
  );
}
