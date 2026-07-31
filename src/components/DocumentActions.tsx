"use client";

import Link from "next/link";
import { useState } from "react";

export default function DocumentActions({ quoteId }: { quoteId: string }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(`/api/cotizaciones/${quoteId}/pdf`);
      if (!res.ok) throw new Error("No se pudo generar el PDF.");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="(.+)"/);
      const filename = match?.[1] || `cotizacion-${quoteId}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="no-print w-full max-w-[760px] flex justify-between mb-4 flex-wrap gap-2.5">
      <Link
        href="/cotizaciones"
        className="bg-transparent border border-[#d7dee6] text-[#374151] rounded-lg px-4 py-2.5 text-sm inline-block"
      >
        ← Volver al listado
      </Link>
      <div className="flex gap-2.5">
        <Link
          href={`/cotizaciones/${quoteId}/editar`}
          className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-lg px-4 py-2.5 text-sm inline-block"
        >
          Editar
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-[#f5a623] text-[#0e2a43] border-0 rounded-lg px-[18px] py-2.5 text-sm font-bold cursor-pointer disabled:opacity-60"
        >
          {downloading ? "Generando PDF..." : "Descargar / Exportar"}
        </button>
      </div>
    </div>
  );
}
