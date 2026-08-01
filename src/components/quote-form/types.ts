import type { TipoItem } from "@/lib/pricing";

export interface VehiculoRow {
  largo: string;
  ancho: string;
  alto: string;
}

export interface ItemState {
  tipo: TipoItem;
  vehiculos: VehiculoRow[];
  cargaM3: string;
  cargaDesc: string;
  embalajeCosto: string;
  cajonCantidad: string;
  cajonDesc: string;
}

export function blankItemState(tipo: TipoItem = "vehiculo"): ItemState {
  return {
    tipo,
    vehiculos: [{ largo: "", ancho: "", alto: "" }],
    cargaM3: "",
    cargaDesc: "",
    embalajeCosto: "",
    cajonCantidad: "1",
    cajonDesc: "",
  };
}

export interface QuoteFormState {
  direccion: "ida" | "vuelta";
  cliente: string;
  correo: string;
  numero: string;
  fecha: string;
  vigenciaDias: string;
  vendedor: string;
  viajeN: string;
  zarpe: string;
  plazoRecepcion: string;
  notas: string;
  items: ItemState[];
}
