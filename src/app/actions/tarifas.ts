"use server";

import { revalidatePath } from "next/cache";
import { requireAdminForAction } from "@/lib/admin-guard";
import { updateTarifas, type Tarifas } from "@/lib/tarifas";

export async function saveTarifas(input: Tarifas): Promise<void> {
  await requireAdminForAction();

  const values = Object.values(input);
  if (values.some((v) => !Number.isFinite(v) || v < 0)) {
    throw new Error("Todos los valores deben ser números válidos y no negativos.");
  }

  await updateTarifas(input);
  // Every quote-editing screen reads tarifas server-side on load.
  revalidatePath("/tarifas");
  revalidatePath("/cotizaciones/nueva");
}
