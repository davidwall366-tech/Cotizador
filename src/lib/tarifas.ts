import "server-only";
import { prisma } from "@/lib/prisma";
import { DEFAULT_TARIFAS, type Tarifas } from "@/lib/pricing";

export type { Tarifas };
export { DEFAULT_TARIFAS };

/** Reads the current pricing rates, creating the singleton row if missing. */
export async function getTarifas(): Promise<Tarifas> {
  const row = await prisma.tarifa.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", ...DEFAULT_TARIFAS },
  });
  return {
    maritimoIdaVehiculo: row.maritimoIdaVehiculo,
    maritimoIdaOtros: row.maritimoIdaOtros,
    maritimoVuelta: row.maritimoVuelta,
    gruaVehiculo: row.gruaVehiculo,
    fabricacionCajon266: row.fabricacionCajon266,
    fabricacionCajon173: row.fabricacionCajon173,
    fabricacionCajon231: row.fabricacionCajon231,
    fundaProteccion: row.fundaProteccion,
    zunchos: row.zunchos,
    tapas: row.tapas,
    consolidacionPorM3: row.consolidacionPorM3,
    arriendoContenedor10: row.arriendoContenedor10,
  };
}

export async function updateTarifas(input: Tarifas): Promise<void> {
  await prisma.tarifa.upsert({
    where: { id: "default" },
    update: input,
    create: { id: "default", ...input },
  });
}
