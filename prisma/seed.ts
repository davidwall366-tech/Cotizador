import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeQuoteTotals, mkItem, DEFAULT_TARIFAS, type QuoteItemInput, type Direccion } from "../src/lib/pricing";

const prisma = new PrismaClient();

async function seedAdmin() {
  const username = process.env.SEED_ADMIN_USERNAME || "admin";
  const password = process.env.SEED_ADMIN_PASSWORD || "cambiar123";
  const nombre = process.env.SEED_ADMIN_NOMBRE || "Administrador";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {},
    create: { username, passwordHash, nombre, role: "ADMIN" },
  });

  console.log(`Usuario admin listo: ${admin.username} (cambia la contraseña por defecto luego de iniciar sesión).`);
  return admin;
}

async function seedQuote(opts: {
  numero: number;
  cliente: string;
  correo: string;
  fecha: string;
  estado: "pendiente" | "aprobada" | "rechazada";
  direccion?: Direccion;
  items: QuoteItemInput[];
  vendedor: string;
  viajeN: string;
  zarpe: string;
  plazoRecepcion: string;
  createdById: string;
}) {
  const existing = await prisma.quote.findUnique({ where: { numero: opts.numero } });
  if (existing) return;

  const direccion = opts.direccion ?? "ida";
  const { lineas, total, abono } = computeQuoteTotals(opts.items, direccion, DEFAULT_TARIFAS);

  await prisma.quote.create({
    data: {
      numero: opts.numero,
      direccion,
      cliente: opts.cliente,
      correo: opts.correo,
      fecha: new Date(opts.fecha),
      vigenciaDias: 7,
      vendedor: opts.vendedor,
      viajeN: opts.viajeN,
      zarpe: opts.zarpe,
      plazoRecepcion: opts.plazoRecepcion,
      notas: "",
      estado: opts.estado,
      lineasJson: JSON.stringify(lineas),
      total,
      abono,
      createdById: opts.createdById,
      items: {
        create: opts.items.map((it, order) => ({
          order,
          tipo: it.tipo,
          cargaM3: it.cargaM3,
          cargaDesc: it.cargaDesc ?? "",
          cajonCantidad: it.cajonCantidad ?? 1,
          cajonDesc: it.cajonDesc ?? "",
          vehiculos: it.vehiculos
            ? { create: it.vehiculos.map((v) => ({ largo: v.largo, ancho: v.ancho, alto: v.alto })) }
            : undefined,
        })),
      },
    },
  });

  console.log(`Cotización N°${opts.numero} (${opts.cliente}) creada.`);
}

async function main() {
  const admin = await seedAdmin();

  await seedQuote({
    numero: 1024,
    cliente: "Marcela Torres",
    correo: "marcela.torres@gmail.com",
    fecha: "2026-07-18",
    estado: "aprobada",
    items: [mkItem("vehiculo", { vehiculos: [{ largo: 4.6, ancho: 1.8, alto: 1.6 }] })],
    vendedor: "David Salinas",
    viajeN: "160",
    zarpe: "Finales de septiembre",
    plazoRecepcion: "Principios de septiembre",
    createdById: admin.id,
  });

  await seedQuote({
    numero: 1025,
    cliente: "Comercial Rapa Nui Ltda.",
    correo: "contacto@comercialrapanui.cl",
    fecha: "2026-07-22",
    estado: "pendiente",
    items: [
      mkItem("cajon266", { cajonCantidad: 1 }),
      mkItem("cajon173", { cajonCantidad: 1 }),
      mkItem("carga_general", { cargaM3: 0.8 }),
    ],
    vendedor: "David Salinas",
    viajeN: "160",
    zarpe: "Finales de septiembre",
    plazoRecepcion: "Principios de septiembre",
    createdById: admin.id,
  });

  await seedQuote({
    numero: 1026,
    cliente: "Pedro Hey",
    correo: "pedro.hey@gmail.com",
    fecha: "2026-07-27",
    estado: "rechazada",
    items: [mkItem("carga_general", { cargaM3: 1 })],
    vendedor: "David Salinas",
    viajeN: "160",
    zarpe: "Finales de septiembre",
    plazoRecepcion: "Principios de septiembre",
    createdById: admin.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
