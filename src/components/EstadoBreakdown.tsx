"use client";

import { useState } from "react";
import { ESTADO_COLORS } from "@/lib/quote-view";

const ORDEN: Array<keyof typeof ESTADO_COLORS> = ["aprobada", "pendiente", "rechazada"];

export default function EstadoBreakdown({
  porEstado,
}: {
  porEstado: Record<string, number>;
}) {
  const [hover, setHover] = useState<string | null>(null);
  const total = ORDEN.reduce((sum, key) => sum + (porEstado[key] || 0), 0);

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
      <div className="text-sm font-bold text-[#0e2a43] mb-4">Estado de las cotizaciones</div>

      {total === 0 ? (
        <div className="text-sm text-[#94a3b8] py-4 text-center">Sin datos en este período.</div>
      ) : (
        <>
          <div className="flex h-6 rounded-md overflow-hidden gap-[2px]">
            {ORDEN.map((key) => {
              const count = porEstado[key] || 0;
              if (count === 0) return null;
              const pct = (count / total) * 100;
              const colors = ESTADO_COLORS[key];
              const isHover = hover === key;
              return (
                <div
                  key={key}
                  className="h-full flex items-center justify-center cursor-default transition-opacity relative"
                  style={{ width: `${pct}%`, background: colors.fg, opacity: isHover ? 0.85 : 1 }}
                  onMouseEnter={() => setHover(key)}
                  onMouseLeave={() => setHover((h) => (h === key ? null : h))}
                >
                  {pct > 12 && (
                    <span className="text-white text-[11px] font-bold">{Math.round(pct)}%</span>
                  )}
                  {isHover && (
                    <div className="absolute bottom-full mb-1.5 whitespace-nowrap bg-[#0e2a43] text-white text-[11px] font-bold rounded-md px-2 py-1 z-10 pointer-events-none">
                      {colors.label}: {count.toLocaleString("es-CL")}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-5 mt-3.5 flex-wrap">
            {ORDEN.map((key) => {
              const count = porEstado[key] || 0;
              const colors = ESTADO_COLORS[key];
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={key} className="flex items-center gap-2 text-[13px]">
                  <span
                    className="w-2.5 h-2.5 rounded-[3px] inline-block shrink-0"
                    style={{ background: colors.fg }}
                  />
                  <span className="text-[#475569]">{colors.label}</span>
                  <span className="font-bold text-[#0e2a43]">
                    {count.toLocaleString("es-CL")} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
