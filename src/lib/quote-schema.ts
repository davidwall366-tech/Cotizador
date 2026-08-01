import { z } from "zod";

const vehiculoSchema = z.object({
  largo: z.coerce.number().min(0).default(0),
  ancho: z.coerce.number().min(0).default(0),
  alto: z.coerce.number().min(0).default(0),
});

const itemSchema = z.object({
  tipo: z.enum(["vehiculo", "carga_general", "cajon266", "cajon173", "cajon231", "contenedor10"]),
  vehiculos: z.array(vehiculoSchema).optional(),
  cargaM3: z.coerce.number().min(0).optional(),
  cargaDesc: z.string().optional().default(""),
  embalajeCosto: z.coerce.number().min(0).optional(),
  cajonCantidad: z.coerce.number().min(1).optional(),
  cajonDesc: z.string().optional().default(""),
});

export const quoteFormSchema = z.object({
  direccion: z.enum(["ida", "vuelta"]).default("ida"),
  cliente: z.string().min(1, "El cliente es obligatorio"),
  correo: z.string().email("Correo inválido"),
  numero: z.coerce.number().int().positive(),
  fecha: z.string().min(1),
  vigenciaDias: z.coerce.number().int().positive().default(7),
  vendedor: z.string().optional().default(""),
  viajeN: z.string().optional().default(""),
  zarpe: z.string().optional().default(""),
  plazoRecepcion: z.string().optional().default(""),
  notas: z.string().optional().default(""),
  items: z.array(itemSchema).min(1, "Agrega al menos un ítem"),
});

export type QuoteFormInput = z.infer<typeof quoteFormSchema>;
