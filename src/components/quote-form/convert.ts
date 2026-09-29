import type { QuoteItemInput } from "@/lib/pricing";
import type { QuoteWithRelations } from "@/lib/quote-view";
import type { ItemState, QuoteFormState } from "./types";

export function dbToFormState(quote: QuoteWithRelations): QuoteFormState {
  return {
    direccion: quote.direccion as "ida" | "vuelta",
    cliente: quote.cliente,
    clienteRut: quote.clienteRut,
    mostrarRut: quote.mostrarRut,
    clienteDireccion: quote.clienteDireccion,
    mostrarDireccion: quote.mostrarDireccion,
    clienteTelefono: quote.clienteTelefono,
    mostrarTelefono: quote.mostrarTelefono,
    correo: quote.correo,
    correosAdicionales: quote.correosAdicionales,
    numero: String(quote.numero),
    descuentoPct: String(quote.descuentoPct ?? 0),
    fecha: quote.fecha.toISOString().slice(0, 10),
    vigenciaDias: String(quote.vigenciaDias),
    vendedor: quote.vendedor,
    viajeN: quote.viajeN,
    zarpe: quote.zarpe,
    plazoRecepcion: quote.plazoRecepcion,
    notas: quote.notas,
    items: quote.items
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((it) => ({
        tipo: it.tipo as ItemState["tipo"],
        vehiculos: it.vehiculos.length
          ? it.vehiculos.map((v) => ({
              largo: String(v.largo),
              ancho: String(v.ancho),
              alto: String(v.alto),
            }))
          : [{ largo: "", ancho: "", alto: "" }],
        vehiculoDesc: it.vehiculoDesc,
        cargaM3: it.cargaM3 != null ? String(it.cargaM3) : "",
        cargaDesc: it.cargaDesc,
        embalajeCosto: it.embalajeCosto != null ? String(it.embalajeCosto) : "",
        cajonCantidad: String(it.cajonCantidad ?? 1),
        cajonDesc: it.cajonDesc,
      })),
  };
}

export function itemStateToInput(it: ItemState): QuoteItemInput {
  return {
    tipo: it.tipo,
    vehiculos: it.vehiculos.map((v) => ({
      largo: Number(v.largo) || 0,
      ancho: Number(v.ancho) || 0,
      alto: Number(v.alto) || 0,
    })),
    vehiculoDesc: it.vehiculoDesc,
    cargaM3: it.cargaM3 === "" ? undefined : Number(it.cargaM3),
    cargaDesc: it.cargaDesc,
    embalajeCosto: it.embalajeCosto === "" ? undefined : Number(it.embalajeCosto),
    cajonCantidad: it.cajonCantidad === "" ? undefined : Number(it.cajonCantidad),
    cajonDesc: it.cajonDesc,
  };
}

export function formStateToPayload(form: QuoteFormState) {
  return {
    direccion: form.direccion,
    cliente: form.cliente,
    clienteRut: form.clienteRut,
    mostrarRut: form.mostrarRut,
    clienteDireccion: form.clienteDireccion,
    mostrarDireccion: form.mostrarDireccion,
    clienteTelefono: form.clienteTelefono,
    mostrarTelefono: form.mostrarTelefono,
    correo: form.correo,
    correosAdicionales: form.correosAdicionales,
    numero: Number(form.numero) || 0,
    descuentoPct: Number(form.descuentoPct) || 0,
    fecha: form.fecha,
    vigenciaDias: Number(form.vigenciaDias) || 7,
    vendedor: form.vendedor,
    viajeN: form.viajeN,
    zarpe: form.zarpe,
    plazoRecepcion: form.plazoRecepcion,
    notas: form.notas,
    items: form.items.map(itemStateToInput),
  };
}
