"use client";

import { useTransition } from "react";
import { deleteEmployee } from "@/app/actions/employees";

export default function DeleteEmployeeButton({
  id,
  nombre,
  disabled,
}: {
  id: string;
  nombre: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      title={disabled ? "No puedes eliminar tu propia cuenta." : undefined}
      onClick={() => {
        if (!confirm(`¿Eliminar al empleado "${nombre}"? Esta acción no se puede deshacer.`)) return;
        startTransition(async () => {
          try {
            await deleteEmployee(id);
          } catch (e) {
            alert(e instanceof Error ? e.message : "No se pudo eliminar el empleado.");
          }
        });
      }}
      className="bg-transparent border border-[#fecaca] text-[#dc2626] rounded-[7px] px-2.5 py-[7px] text-[13px] inline-block disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Borrar
    </button>
  );
}
