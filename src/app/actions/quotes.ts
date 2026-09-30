"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { requireAdminForAction } from "@/lib/admin-guard";
import { computeQuoteTotals, itemValid, type QuoteItemInput } from "@/lib/pricing";
import { getTarifas } from "@/lib/tarifas";
import { ZodError } from "zod";
import { quoteFormSchema, type QuoteFormInput } from "@/lib/quote-schema";
import { autoExportQuoteToDropbox, notifyEstadoChange } from "@/app/actions/integrations";
import { normalize } from "@/lib/text-normalize";

/**
 * Quotes for this same client (matched case/accent-insensitively) issued
 * since the start of the current calendar month, excluding "rechazada" —
 * used to warn against accidentally re-quoting a client already in
 * progress this month. Naturally stops firing once the month rolls over,
 * since last month's quotes fall outside the range.
 */
export async function checkClienteEnCurso(
  cliente: string
): Promise<{ numero: number; estado: string }[]> {
  const needle = normalize(cliente.trim());
  if (!needle) return [];

  const now = new Date();
  const inicioMes = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const quotes = await prisma.quote.findMany({
    where: { fecha: { gte: inicioMes }, estado: { not: "rechazada" } },
    select: { numero: true, cliente: true, estado: true },
  });

  return quotes
    .filter((q) => normalize(q.cliente) === needle)
    .map((q) => ({ numero: q.numero, estado: q.estado }));
}

export async function getNextNumero(): Promise<number> {
  const last = await prisma.quote.findFirst({ orderBy: { numero: "desc" } });
  return (last?.numero ?? 1023) + 1;
}

function toItemInputs(items: QuoteFormInput["items"]): QuoteItemInput[] {
  return items.map((it) => ({
    tipo: it.tipo,
    vehiculos: it.vehiculos,
    vehiculoDesc: it.vehiculoDesc,
    cargaM3: it.cargaM3,
    cargaDesc: it.cargaDesc,
    embalajeCosto: it.embalajeCosto,
    cajonCantidad: it.cajonCantidad,
    cajonDesc: it.cajonDesc,
  }));
}

function validateBusinessRules(input: QuoteFormInput) {
  if (!input.items.every((it) => itemValid(it as QuoteItemInput))) {
    throw new Error("Todos los ítems deben tener datos válidos.");
  }
}

/**
 * Server Actions only forward a plain `Error`'s message to the client in
 * production — a raw ZodError comes through as Next's generic "Server
 * Components render" message, with the real reason hidden. Converting it
 * to a plain Error here is what lets QuoteForm's catch block show the
 * actual problem (e.g. "Correo inválido") instead of that dead end.
 */
function parseQuoteInput(raw: QuoteFormInput): QuoteFormInput {
  try {
    return quoteFormSchema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw new Error(err.issues[0]?.message || "Los datos de la cotización no son válidos.");
    }
    throw err;
  }
}

export async function createQuote(raw: QuoteFormInput): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const input = parseQuoteInput(raw);
  validateBusinessRules(input);

  // The "N° de cotización" field is locked to non-admins in the UI; enforce
  // it server-side too so a crafted request can't pick an arbitrary number.
  const numero = session.user.role === "ADMIN" ? input.numero : await getNextNumero();
  // Same lock for the discount — only an admin can grant one.
  const descuentoPct = session.user.role === "ADMIN" ? input.descuentoPct : 0;

  const itemInputs = toItemInputs(input.items);
  const tarifas = await getTarifas();
  const { lineas, total, abono } = computeQuoteTotals(itemInputs, input.direccion, tarifas, descuentoPct);

  const quote = await prisma.quote.create({
    data: {
      numero,
      descuentoPct,
      direccion: input.direccion,
      cliente: input.cliente,
      clienteRut: input.clienteRut,
      mostrarRut: input.mostrarRut,
      clienteDireccion: input.clienteDireccion,
      mostrarDireccion: input.mostrarDireccion,
      clienteTelefono: input.clienteTelefono,
      mostrarTelefono: input.mostrarTelefono,
      correo: input.correo,
      correosAdicionales: input.correosAdicionales,
      fecha: new Date(input.fecha),
      vigenciaDias: input.vigenciaDias,
      vendedor: input.vendedor,
      viajeN: input.viajeN,
      zarpe: input.zarpe,
      plazoRecepcion: input.plazoRecepcion,
      notas: input.notas,
      estado: "pendiente",
      lineasJson: JSON.stringify(lineas),
      total,
      abono,
      createdById: session.user.id,
      items: {
        create: input.items.map((it, order) => ({
          order,
          tipo: it.tipo,
          vehiculoDesc: it.vehiculoDesc,
          cargaM3: it.cargaM3,
          cargaDesc: it.cargaDesc,
          embalajeCosto: it.embalajeCosto,
          cajonCantidad: it.cajonCantidad ?? 1,
          cajonDesc: it.cajonDesc,
          vehiculos: it.vehiculos
            ? { create: it.vehiculos.map((v) => ({ largo: v.largo, ancho: v.ancho, alto: v.alto })) }
            : undefined,
        })),
      },
    },
  });

  revalidatePath("/cotizaciones");
  after(() => autoExportQuoteToDropbox(quote.id));
  return { id: quote.id };
}

export async function updateQuote(id: string, raw: QuoteFormInput): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const input = parseQuoteInput(raw);
  validateBusinessRules(input);

  // Same server-side lock as createQuote: only an admin may change the
  // number or the discount.
  let numero = input.numero;
  let descuentoPct = input.descuentoPct;
  if (session.user.role !== "ADMIN") {
    const existing = await prisma.quote.findUnique({
      where: { id },
      select: { numero: true, descuentoPct: true },
    });
    if (!existing) throw new Error("Cotización no encontrada.");
    numero = existing.numero;
    descuentoPct = existing.descuentoPct;
  }

  const itemInputs = toItemInputs(input.items);
  const tarifas = await getTarifas();
  const { lineas, total, abono } = computeQuoteTotals(itemInputs, input.direccion, tarifas, descuentoPct);

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
    prisma.quote.update({
      where: { id },
      data: {
        numero,
        descuentoPct,
        direccion: input.direccion,
        cliente: input.cliente,
        clienteRut: input.clienteRut,
        mostrarRut: input.mostrarRut,
        clienteDireccion: input.clienteDireccion,
        mostrarDireccion: input.mostrarDireccion,
        clienteTelefono: input.clienteTelefono,
        mostrarTelefono: input.mostrarTelefono,
        correo: input.correo,
        correosAdicionales: input.correosAdicionales,
        fecha: new Date(input.fecha),
        vigenciaDias: input.vigenciaDias,
        vendedor: input.vendedor,
        viajeN: input.viajeN,
        zarpe: input.zarpe,
        plazoRecepcion: input.plazoRecepcion,
        notas: input.notas,
        lineasJson: JSON.stringify(lineas),
        total,
        abono,
        // fecha/vigenciaDias may have changed, so let the expiration cron
        // re-evaluate this quote instead of treating it as already alerted.
        alertaVencimientoEnviada: false,
        items: {
          create: input.items.map((it, order) => ({
            order,
            tipo: it.tipo,
            vehiculoDesc: it.vehiculoDesc,
            cargaM3: it.cargaM3,
            cargaDesc: it.cargaDesc,
            embalajeCosto: it.embalajeCosto,
            cajonCantidad: it.cajonCantidad ?? 1,
            cajonDesc: it.cajonDesc,
            vehiculos: it.vehiculos
              ? { create: it.vehiculos.map((v) => ({ largo: v.largo, ancho: v.ancho, alto: v.alto })) }
              : undefined,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);
  after(() => autoExportQuoteToDropbox(id));
  return { id };
}

export async function setEstado(
  id: string,
  estado: "pendiente" | "aprobada" | "aprobada_sin_abono" | "rechazada"
) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const existing = await prisma.quote.findUnique({ where: { id }, select: { estado: true } });
  if (!existing) throw new Error("Cotización no encontrada.");

  await prisma.quote.update({
    where: { id },
    data: {
      estado,
      // Reopening a quote back to pendiente should let the expiration cron
      // alert on it again once its vigencia is reached.
      alertaVencimientoEnviada: estado === "pendiente" ? false : undefined,
    },
  });
  revalidatePath("/cotizaciones");
  revalidatePath(`/cotizaciones/${id}`);

  // Notify the client only on an actual transition into an approved/rejected
  // estado — not when re-saving a quote that's already in that estado.
  if (
    estado !== existing.estado &&
    (estado === "aprobada" || estado === "aprobada_sin_abono" || estado === "rechazada")
  ) {
    after(() => notifyEstadoChange(id, estado));
  }
}

export async function deleteQuote(id: string) {
  await requireAdminForAction();

  await prisma.quote.delete({ where: { id } });
  revalidatePath("/cotizaciones");
}
