"use client";

import { useTransition } from "react";
import { setEstado } from "@/app/actions/quotes";
import { ESTADO_COLORS } from "@/lib/quote-view";

type EstadoValue = "pendiente" | "aprobada" | "aprobada_sin_abono" | "rechazada";

export default function EstadoSelect({ id, estado }: { id: string; estado: EstadoValue }) {
  const [isPending, startTransition] = useTransition();
  const colors = ESTADO_COLORS[estado];

  return (
    <select
      value={estado}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as EstadoValue;
        startTransition(() => {
          setEstado(id, value);
        });
      }}
      style={{ background: colors.bg, color: colors.fg }}
      className="px-2 py-1.5 rounded-md border border-transparent text-xs font-bold cursor-pointer"
    >
      <option value="pendiente">Pendiente</option>
      <option value="aprobada">Aprobada con Abono</option>
      <option value="aprobada_sin_abono">Aprobada sin Abono</option>
      <option value="rechazada">Rechazada</option>
    </select>
  );
}
