// Pricing engine for the Cotizador de Embarque — Naviera GV.
//
// This is a faithful, typed port of the logic in the approved design
// prototype (`Cotizador Naviera GV.dc.html`, functions computeLineas,
// incluyeForTipos, condicionesForTipos, maritimoRate, fmtCLP, fmtDate).
// All copy and numeric constants here are treated as final per the README
// — do not "clean up" wording or round differently without checking back
// against the prototype.

export type TipoItem =
  | "vehiculo"
  | "carga_general"
  | "cajon266"
  | "cajon173"
  | "cajon231"
  | "contenedor10";

export type Direccion = "ida" | "vuelta";

export interface VehiculoInput {
  largo: number;
  ancho: number;
  alto: number;
}

export interface QuoteItemInput {
  tipo: TipoItem;
  vehiculos?: VehiculoInput[];
  cargaM3?: number;
  cargaDesc: string;
  cajonCantidad?: number;
  cajonDesc: string;
}

export interface LineaCosto {
  label: string;
  value: number;
}

export interface TipoMeta {
  label: string;
  badge: string;
  color: string;
  intro: string;
  dims?: string;
  m3?: number;
}

export const TIPOS_META: Record<TipoItem, TipoMeta> = {
  vehiculo: {
    label: "Vehículos",
    badge: "V",
    color: "#1f6fb8",
    intro: "el traslado de su vehículo",
  },
  carga_general: {
    label: "Carga general",
    badge: "CG",
    color: "#f5a623",
    intro: "el servicio de transporte de carga general suelta",
  },
  cajon266: {
    label: "Cajón 2,66 m³",
    badge: "C2",
    color: "#15803d",
    intro: "el servicio de transporte consolidado en cajón de madera",
    dims: "2,20 × 1,15 × 1,05 m",
  },
  cajon173: {
    label: "Cajón 1,73 m³",
    badge: "C1",
    color: "#b45309",
    intro: "el servicio de transporte consolidado en cajón de madera",
    dims: "1,30 × 0,98 × 1,36 m",
  },
  cajon231: {
    label: "Cajón 2,31 m³",
    badge: "C3",
    color: "#0e7490",
    intro: "el servicio de transporte consolidado en cajón de madera",
    dims: "2,20 × 1,05 × 1,00 m",
  },
  contenedor10: {
    label: "Contenedor 10 pies",
    badge: "CT",
    color: "#6d28d9",
    intro: "el traslado de sus enseres",
    dims: "Capacidad 21,3 m³",
    m3: 21.3,
  },
};

export const TIPO_ORDER: TipoItem[] = [
  "vehiculo",
  "carga_general",
  "cajon266",
  "cajon173",
  "cajon231",
  "contenedor10",
];

export function fmtCLP(n: number): string {
  const v = Math.round(n || 0);
  return "$" + v.toLocaleString("es-CL");
}

function fmtRate(n: number): string {
  return "$" + n.toLocaleString("es-CL");
}

export function fmtDate(iso: string | Date | null | undefined): string {
  if (!iso) return "—";
  const isoStr =
    iso instanceof Date ? iso.toISOString().slice(0, 10) : String(iso).slice(0, 10);
  const [y, m, d] = isoStr.split("-");
  return y && m && d ? `${d}-${m}-${y}` : isoStr;
}

export function maritimoRate(tipo: TipoItem, direccion: Direccion): number {
  if (direccion === "vuelta") return 132800;
  return tipo === "vehiculo" ? 255800 : 240800;
}

export function blankItem(tipo: TipoItem = "vehiculo"): QuoteItemInput {
  return {
    tipo,
    vehiculos: [{ largo: 0, ancho: 0, alto: 0 }],
    cargaM3: undefined,
    cargaDesc: "",
    cajonCantidad: 1,
    cajonDesc: "",
  };
}

export function mkItem(tipo: TipoItem, overrides: Partial<QuoteItemInput> = {}): QuoteItemInput {
  return { ...blankItem(tipo), ...overrides };
}

export function itemValid(item: QuoteItemInput): boolean {
  if (item.tipo === "vehiculo") {
    return (item.vehiculos || []).some(
      (v) => Number(v.largo) > 0 && Number(v.ancho) > 0 && Number(v.alto) > 0
    );
  }
  if (item.tipo === "carga_general") return Number(item.cargaM3) > 0;
  return Number(item.cajonCantidad) > 0;
}

export function tiposPresentesOf(items: QuoteItemInput[]): TipoItem[] {
  const set = new Set(items.map((it) => it.tipo));
  return TIPO_ORDER.filter((t) => set.has(t));
}

export function tipoLabelOf(items: QuoteItemInput[]): string {
  return tiposPresentesOf(items)
    .map((t) => TIPOS_META[t].label)
    .join(" + ");
}

/** Computes the itemized cost lines for a single quote item. */
export function computeLineas(item: QuoteItemInput, direccion: Direccion): LineaCosto[] {
  const tipo = item.tipo;
  const rate = maritimoRate(tipo, direccion);
  const lineas: LineaCosto[] = [];

  if (tipo === "vehiculo") {
    const rows = (item.vehiculos || []).filter(
      (v) => Number(v.largo) > 0 && Number(v.ancho) > 0 && Number(v.alto) > 0
    );
    const totalM3 = rows.reduce((s, v) => s + Number(v.largo) * Number(v.ancho) * Number(v.alto), 0);
    const m3r = Math.round(totalM3 * 100) / 100;
    const count = rows.length;
    lineas.push({
      label: `Transporte Marítimo (${m3r} m³ × ${fmtRate(rate)}/m³)`,
      value: Math.round(m3r * rate),
    });
    const gruaLabel =
      direccion === "vuelta"
        ? `Camión Grúa - traslado a bodega de acopio en Quilpué (${count} vehículo${count === 1 ? "" : "s"} × $95.000)`
        : `Camión Grúa - traslado a puerto (${count} vehículo${count === 1 ? "" : "s"} × $95.000)`;
    lineas.push({ label: gruaLabel, value: count * 95000 });
  } else if (tipo === "carga_general") {
    const m3 = Number(item.cargaM3) || 0;
    lineas.push({
      label: `Transporte Marítimo Carga General (${m3} m³ × ${fmtRate(rate)}/m³)`,
      value: Math.round(m3 * rate),
    });
  } else if (tipo === "cajon266") {
    const qty = Number(item.cajonCantidad) || 0;
    if (direccion !== "vuelta") {
      lineas.push({ label: `Fabricación de Cajón 2,66 m³ × ${qty}`, value: 84000 * qty });
      lineas.push({ label: `Funda de Protección × ${qty}`, value: 21000 * qty });
      lineas.push({ label: `Consolidación (2,66 m³ × $11.000/m³) × ${qty}`, value: 29260 * qty });
    }
    lineas.push({
      label: `Transporte Marítimo (2,66 m³ × ${fmtRate(rate)}/m³) × ${qty}`,
      value: Math.round(2.66 * rate) * qty,
    });
  } else if (tipo === "cajon173") {
    const qty = Number(item.cajonCantidad) || 0;
    if (direccion !== "vuelta") {
      lineas.push({ label: `Fabricación de Cajón 1,73 m³ × ${qty}`, value: 66000 * qty });
      lineas.push({ label: `Funda de Protección × ${qty}`, value: 21000 * qty });
      lineas.push({ label: `Consolidación (1,73 m³ × $11.000/m³) × ${qty}`, value: 19030 * qty });
    }
    lineas.push({
      label: `Transporte Marítimo (1,73 m³ × ${fmtRate(rate)}/m³) × ${qty}`,
      value: Math.round(1.73 * rate) * qty,
    });
  } else if (tipo === "cajon231") {
    const qty = Number(item.cajonCantidad) || 0;
    if (direccion !== "vuelta") {
      lineas.push({ label: `Fabricación de Cajón 2,31 m³ × ${qty}`, value: 84000 * qty });
      lineas.push({ label: `Funda de Protección × ${qty}`, value: 21000 * qty });
      lineas.push({
        label: `Consolidación (2,31 m³ × $11.000/m³) × ${qty}`,
        value: Math.round(2.31 * 11000) * qty,
      });
    }
    lineas.push({
      label: `Transporte Marítimo (2,31 m³ × ${fmtRate(rate)}/m³) × ${qty}`,
      value: Math.round(2.31 * rate) * qty,
    });
  } else if (tipo === "contenedor10") {
    const qty = Number(item.cajonCantidad) || 0;
    const m3 = 21.3;
    const m3Str = "21,3";
    if (direccion !== "vuelta") {
      lineas.push({ label: `Arriendo de Contenedor × ${qty}`, value: 45000 * qty });
      lineas.push({
        label: `Consolidación (${m3Str} m³ × $11.000/m³) × ${qty}`,
        value: Math.round(m3 * 11000) * qty,
      });
    }
    lineas.push({
      label: `Transporte Marítimo (${m3Str} m³ × ${fmtRate(rate)}/m³) × ${qty}`,
      value: Math.round(m3 * rate) * qty,
    });
  }

  return lineas;
}

export function computeQuoteTotals(items: QuoteItemInput[], direccion: Direccion) {
  const lineas = items.flatMap((it) => computeLineas(it, direccion));
  const total = lineas.reduce((s, l) => s + l.value, 0);
  const abono = Math.round(total / 2);
  return { lineas, total, abono };
}

/** Point 3 — "El servicio incluye" bullets, built from the item types present. */
export function incluyeForTipos(tiposPresentes: TipoItem[], direccion: Direccion): string[] {
  if (direccion === "vuelta") {
    return [
      "Recepción de carga en el muelle de Hanga Piko.",
      "Embarque y pago a SASIPA.",
      "Transporte marítimo a Valparaíso.",
      "Retiro en bodega de acopio de Quilpué (Av. Los Carrera 01948, sector Paso Hondo).",
    ];
  }
  const lines = ["Recepción de la carga en nuestra bodega de Quilpué."];
  if (tiposPresentes.includes("cajon266"))
    lines.push(`Confección de un cajón a la medida (Dimensiones: ${TIPOS_META.cajon266.dims}).`);
  if (tiposPresentes.includes("cajon173"))
    lines.push(`Confección de un cajón a la medida (Dimensiones: ${TIPOS_META.cajon173.dims}).`);
  if (tiposPresentes.includes("cajon231"))
    lines.push(`Confección de un cajón a la medida (${TIPOS_META.cajon231.dims}).`);
  if (tiposPresentes.includes("contenedor10"))
    lines.push("Arriendo de contenedor de 10 pies y maniobras de consolidación de la carga.");
  lines.push(
    "Traslado terrestre hacia Valparaíso el día del embarque" +
      (tiposPresentes.includes("vehiculo") ? " (en grúa para los vehículos)" : "") +
      "."
  );
  lines.push("Maniobras de embarque y transporte marítimo.");
  lines.push("Descarga con la carga puesta sobre camión en Rapa Nui (pago directo a SASIPA).");
  return lines;
}

export interface Condicion {
  text: string;
  highlight: boolean;
}

/** Point 5 — "Condiciones" bullets, built from the item types present. */
export function condicionesForTipos(tiposPresentes: TipoItem[], vigenciaDias: number): Condicion[] {
  const lines: string[] = [];
  if (tiposPresentes.includes("vehiculo")) {
    lines.push(
      "Identificación de vehículos: al entregarlos debe indicarse la ubicación exacta de los números de chasis y motor, coincidentes estrictamente con el padrón; de lo contrario no se recibirán."
    );
    lines.push(
      "Carga interna: los vehículos deben entregarse completamente vacíos, sin carga ni efectos personales en su interior."
    );
    lines.push(
      "Limpieza para inspección: deben entregarse limpios y sin cera. Si se presentan sucios, no se revisará el estado de la pintura y no se aceptarán reclamos posteriores."
    );
    lines.push(
      "Modalidad de traslado (funda de protección): si no se informa una preferencia, se asumirá que viajarán con funda. Naviera GV no se responsabiliza por desgastes derivados del transporte marítimo."
    );
  }
  lines.push("Debe entregar su carga embalada y lista para el transporte.");
  if (tiposPresentes.includes("contenedor10")) {
    lines.push(
      "Alcance del servicio: operamos exclusivamente el tramo marítimo hasta el puerto de destino; no realizamos retiros a domicilio ni entregas finales. El cliente debe retirar la carga y devolver el contenedor vacío el mismo día de la descarga."
    );
    lines.push("Restricción de peso: el contenedor no puede superar las 5 toneladas de carga (tara vacía: 1.450 kg).");
  }
  lines.push("Verificación de medidas: las dimensiones y volumen definitivos se corroborarán al momento de la recepción.");
  lines.push(
    "Documentación de valor: es obligatorio entregar la carga acompañada de los documentos que acrediten su valor comercial para efectos de cobertura del seguro."
  );
  lines.push(`La vigencia de esta cotización es de ${vigenciaDias || 7} días desde su emisión para efectuar el abono de reserva.`);

  return lines.map((text) => ({
    text,
    highlight: text.indexOf("Restricción de peso") === 0,
  }));
}

export const DIRECCION_LABEL: Record<Direccion, string> = {
  ida: "Valparaíso → Rapa Nui",
  vuelta: "Rapa Nui → Valparaíso",
};

export function introForTipos(tiposPresentes: TipoItem[]): string {
  return tiposPresentes.length === 1
    ? TIPOS_META[tiposPresentes[0]].intro
    : "el servicio de transporte de su carga, según el detalle indicado a continuación";
}

export function logisticaTitulo(direccion: Direccion): string {
  return direccion === "vuelta" ? "7. Logística de Entrega en Muelle" : "7. Logística de Recepción en Bodega";
}

export function plazoRecepcionLabel(direccion: Direccion): string {
  return direccion === "vuelta" ? "Fecha de entrega en el puerto" : "Rango de entrega en bodega";
}
