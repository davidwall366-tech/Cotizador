"use client";

import { useTransition } from "react";
import { setEstado } from "@/app/actions/quotes";
import { ESTADO_COLORS } from "@/lib/quote-view";

export default function EstadoSelect({
  id,
  estado,
}: {
  id: string;
  estado: "pendiente" | "aprobada" | "rechazada";
}) {
  const [isPending, startTransition] = useTransition();
  const colors = ESTADO_COLORS[estado];

  return (
    <select
      value={estado}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value as "pendiente" | "aprobada" | "rechazada";
        startTransition(() => {
          setEstado(id, value);
        });
      }}
      style={{ background: colors.bg, color: colors.fg }}
      className="px-2 py-1.5 rounded-md border border-transparent text-xs font-bold cursor-pointer"
    >
      <option value="pendiente">Pendiente</option>
      <option value="aprobada">Aprobada</option>
      <option value="rechazada">Rechazada</option>
    </select>
  );
}
