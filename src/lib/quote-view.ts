import type { Prisma } from "@prisma/client";
import type { Condicion, Direccion, LineaCosto, QuoteItemInput, TipoItem } from "@/lib/pricing";
import {
  DIRECCION_LABEL,
  condicionesForTipos,
  fmtDate,
  incluyeForTipos,
  introForTipos,
  logisticaTitulo,
  plazoRecepcionLabel,
  tiposPresentesOf,
  tipoLabelOf,
} from "@/lib/pricing";

export type QuoteWithRelations = Prisma.QuoteGetPayload<{
  include: { items: { include: { vehiculos: true } } };
}>;

export function itemsFromDb(quote: QuoteWithRelations): QuoteItemInput[] {
  return quote.items
    .sort((a, b) => a.order - b.order)
    .map((it) => ({
      tipo: it.tipo as TipoItem,
      vehiculos: it.vehiculos.map((v) => ({ largo: v.largo, ancho: v.ancho, alto: v.alto })),
      cargaM3: it.cargaM3 ?? undefined,
      cargaDesc: it.cargaDesc,
      cajonCantidad: it.cajonCantidad,
      cajonDesc: it.cajonDesc,
    }));
}

export function lineasFromSnapshot(quote: QuoteWithRelations): LineaCosto[] {
  try {
    return JSON.parse(quote.lineasJson) as LineaCosto[];
  } catch {
    return [];
  }
}

export function tipoLabelForQuote(quote: QuoteWithRelations): string {
  return tipoLabelOf(itemsFromDb(quote));
}

export const ESTADO_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  pendiente: { bg: "#fef3c7", fg: "#92400e", label: "Pendiente" },
  aprobada: { bg: "#dcfce7", fg: "#166534", label: "Aprobada" },
  rechazada: { bg: "#fee2e2", fg: "#991b1b", label: "Rechazada" },
};

export interface QuoteDocumentViewModel {
  numero: number;
  fecha: string;
  tipoLabel: string;
  estado: { bg: string; fg: string; label: string };
  cliente: string;
  correo: string;
  intro: string;
  viajeN: string;
  direccionLabel: string;
  zarpe: string;
  vigenciaDias: number;
  lineas: LineaCosto[];
  total: number;
  abono: number;
  incluye: string[];
  condiciones: Condicion[];
  logisticaTitulo: string;
  esVuelta: boolean;
  plazoRecepcionLabel: string;
  plazoRecepcion: string;
  notas: string;
  vendedor: string;
}

/** Derives everything the formal document needs to render from a stored quote. */
export function buildQuoteDocumentViewModel(quote: QuoteWithRelations): QuoteDocumentViewModel {
  const direccion = quote.direccion as Direccion;
  const items = itemsFromDb(quote);
  const tiposPresentes = tiposPresentesOf(items);

  return {
    numero: quote.numero,
    fecha: fmtDate(quote.fecha),
    tipoLabel: tipoLabelOf(items),
    estado: ESTADO_COLORS[quote.estado],
    cliente: quote.cliente,
    correo: quote.correo,
    intro: introForTipos(tiposPresentes),
    viajeN: quote.viajeN || "—",
    direccionLabel: DIRECCION_LABEL[direccion],
    zarpe: quote.zarpe || "—",
    vigenciaDias: quote.vigenciaDias,
    lineas: lineasFromSnapshot(quote),
    total: quote.total,
    abono: quote.abono,
    incluye: incluyeForTipos(tiposPresentes, direccion),
    condiciones: condicionesForTipos(tiposPresentes, quote.vigenciaDias),
    logisticaTitulo: logisticaTitulo(direccion),
    esVuelta: direccion === "vuelta",
    plazoRecepcionLabel: plazoRecepcionLabel(direccion),
    plazoRecepcion: quote.plazoRecepcion || "—",
    notas: quote.notas || "",
    vendedor: quote.vendedor || "Naviera GV",
  };
}
