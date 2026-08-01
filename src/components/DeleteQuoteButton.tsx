"use client";

import { useTransition } from "react";
import { deleteQuote } from "@/app/actions/quotes";

export default function DeleteQuoteButton({ id, numero }: { id: string; numero: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`¿Eliminar la cotización N° ${numero}? Esta acción no se puede deshacer.`)) return;
        startTransition(() => {
          deleteQuote(id);
        });
      }}
      className="bg-transparent border border-[#fecaca] text-[#dc2626] rounded-[7px] px-2.5 py-[7px] text-[13px] inline-block disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Borrar
    </button>
  );
}
