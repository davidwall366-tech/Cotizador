"use client";

import { useState } from "react";

interface Point {
  key: string;
  label: string;
  value: number;
}

function fmtCLP(n: number): string {
  return "$" + Math.round(n || 0).toLocaleString("es-CL");
}

function fmtCount(n: number): string {
  return Math.round(n || 0).toLocaleString("es-CL");
}

// "Sep 2025" -> "Sep '25" — short enough to sit under a 24px-wide bar.
function shortLabel(label: string): string {
  const [mes, anio] = label.split(" ");
  return anio ? `${mes} '${anio.slice(2)}` : label;
}

function niceMax(max: number): number {
  if (max <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= max) return candidate;
  }
  return 10 * magnitude;
}

export default function BarChart({
  title,
  data,
  format,
}: {
  title: string;
  data: Point[];
  format: "count" | "clp";
}) {
  const formatValue = format === "clp" ? fmtCLP : fmtCount;
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...data.map((d) => d.value)));
  const hasData = data.some((d) => d.value > 0);
  // Bars cap below 100% so the tallest one still leaves headroom for its hover tooltip.
  const BAR_CAP = 92;

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
      <div className="text-sm font-bold text-[#0e2a43] mb-4">{title}</div>

      {!hasData ? (
        <div className="text-sm text-[#94a3b8] py-10 text-center">Sin datos en este período.</div>
      ) : (
        <div className="overflow-x-auto">
          <div
            className="flex gap-3.5 pr-8"
            style={{ minWidth: data.length > 8 ? data.length * 44 : undefined }}
          >
            {/* y-axis ticks */}
            <div
              className="flex flex-col justify-between text-[11px] text-[#94a3b8] py-0 shrink-0"
              style={{ height: 160 }}
            >
              <span>{formatValue(max)}</span>
              <span>{formatValue(max / 2)}</span>
              <span>0</span>
            </div>

            <div className="flex-1 flex items-end gap-[3px] relative" style={{ height: 160 }}>
              {/* recessive gridlines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                <div className="border-t border-[#eef1f4]" />
                <div className="border-t border-[#eef1f4]" />
                <div className="border-t border-[#e2e8f0]" />
              </div>

              {data.map((d, i) => {
                const heightPct =
                  max > 0 ? Math.max((d.value / max) * BAR_CAP, d.value > 0 ? 2 : 0) : 0;
                const isHover = hover === i;
                return (
                  <div
                    key={d.key}
                    className="flex-1 min-w-[6px] max-w-[24px] h-full flex flex-col justify-end items-center relative"
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                    onFocus={() => setHover(i)}
                    onBlur={() => setHover((h) => (h === i ? null : h))}
                    tabIndex={0}
                  >
                    {isHover && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 mb-1.5 whitespace-nowrap bg-[#0e2a43] text-white text-[11px] font-bold rounded-md px-2 py-1 z-10 pointer-events-none"
                        style={{ bottom: `${heightPct}%` }}
                      >
                        <div className="text-[#9fb4c7] font-medium">{d.label}</div>
                        {formatValue(d.value)}
                      </div>
                    )}
                    <div
                      className="w-full rounded-t-[4px] transition-colors"
                      style={{
                        height: `${heightPct}%`,
                        background: isHover ? "#f5a623" : "#0e2a43",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-[3px] mt-2 pl-[52px] relative" style={{ height: 14 }}>
            {data.map((d, i) => {
              // Thin to every other tick, anchored on the most recent month so it's
              // never dropped and no two shown labels ever end up adjacent.
              const show = data.length <= 8 || i % 2 === (data.length - 1) % 2;
              return (
                <div
                  key={d.key}
                  className="flex-1 min-w-[6px] max-w-[24px] text-center text-[10px] text-[#94a3b8] whitespace-nowrap"
                  style={{ overflow: "visible" }}
                >
                  {show ? shortLabel(d.label) : ""}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
