"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { computeQuoteTotals, itemValid, type QuoteItemInput } from "@/lib/pricing";
import { quoteFormSchema, type QuoteFormInput } from "@/lib/quote-schema";
import { autoExportQuoteToDropbox } from "@/app/actions/integrations";

export async function getNextNumero(): Promise<number> {
  const last = await prisma.quote.findFirst({ orderBy: { numero: "desc" } });
  return (last?.numero ?? 1023) + 1;
}

function toItemInputs(items: QuoteFormInput["items"]): QuoteItemInput[] {
  return items.map((it) => ({
    tipo: it.tipo,
    vehiculos: it.vehiculos,
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

export async function createQuote(raw: QuoteFormInput): Promise<{ id: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  const input = quoteFormSchema.parse(raw);
  validateBusinessRules(input);

  const itemInputs = toItemInputs(input.items);
  const { lineas, total, abono } = computeQuoteTotals(itemInputs, input.direccion);

  const quote = await prisma.quote.create({
    data: {
      numero: input.numero,
      direccion: input.direccion,
      cliente: input.cliente,
      correo: input.correo,
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

  const input = quoteFormSchema.parse(raw);
  validateBusinessRules(input);

  const itemInputs = toItemInputs(input.items);
  const { lineas, total, abono } = computeQuoteTotals(itemInputs, input.direccion);

  await prisma.$transaction([
    prisma.quoteItem.deleteMany({ where: { quoteId: id } }),
    prisma.quote.update({
      where: { id },
      data: {
        numero: input.numero,
        direccion: input.direccion,
        cliente: input.cliente,
        correo: input.correo,
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

export async function setEstado(id: string, estado: "pendiente" | "aprobada" | "rechazada") {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

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
}

export async function deleteQuote(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("No autenticado.");

  await prisma.quote.delete({ where: { id } });
  revalidatePath("/cotizaciones");
}
