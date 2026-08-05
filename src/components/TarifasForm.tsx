"use client";

import { useState, useTransition } from "react";
import { saveTarifas } from "@/app/actions/tarifas";
import type { Tarifas } from "@/lib/pricing";

const lblStyle = "text-[13px] font-semibold text-[#374151] block mb-1.5";
const inputStyle =
  "w-full px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm outline-none font-[inherit]";

interface FieldDef {
  key: keyof Tarifas;
  label: string;
  suffix: string;
}

const GRUPOS: { titulo: string; nota?: string; campos: FieldDef[] }[] = [
  {
    titulo: "Transporte marítimo",
    campos: [
      { key: "maritimoIdaVehiculo", label: "Ida — Vehículos", suffix: "$ / m³" },
      { key: "maritimoIdaOtros", label: "Ida — Carga general, cajones y contenedor", suffix: "$ / m³" },
      { key: "maritimoVuelta", label: "Vuelta — Todos los tipos de carga", suffix: "$ / m³" },
    ],
  },
  {
    titulo: "Vehículos",
    campos: [{ key: "gruaVehiculo", label: "Camión grúa (traslado)", suffix: "$ / vehículo" }],
  },
  {
    titulo: "Cajones — Fabricación",
    campos: [
      { key: "fabricacionCajon266", label: "Cajón 2,66 m³", suffix: "$ / cajón" },
      { key: "fabricacionCajon173", label: "Cajón 1,73 m³", suffix: "$ / cajón" },
      { key: "fabricacionCajon231", label: "Cajón 2,31 m³", suffix: "$ / cajón" },
    ],
  },
  {
    titulo: "Cajones — Accesorios (todas las medidas)",
    nota: "Zunchos, Tapas y Nylon solo aparecen en la cotización si su valor es mayor a $0.",
    campos: [
      { key: "fundaProteccion", label: "Funda de protección", suffix: "$ / cajón" },
      { key: "zunchos", label: "Zunchos", suffix: "$ / cajón" },
      { key: "tapas", label: "Tapas", suffix: "$ / cajón" },
      { key: "nylon", label: "Nylon", suffix: "$ / cajón" },
    ],
  },
  {
    titulo: "Cajones y contenedor",
    campos: [
      { key: "consolidacionPorM3", label: "Consolidación", suffix: "$ / m³" },
      { key: "arriendoContenedor10", label: "Arriendo de contenedor 10 pies", suffix: "$ / contenedor" },
    ],
  },
  {
    titulo: "Seguro de carga",
    nota: "Se aplica al volumen de cada ítem (vehículos, carga general, cajones y contenedor). Solo aparece en la cotización si su valor es mayor a $0.",
    campos: [{ key: "seguroCargaPorM3", label: "Seguro de carga", suffix: "$ / m³" }],
  },
];

export default function TarifasForm({ initial }: { initial: Tarifas }) {
  const [values, setValues] = useState<Tarifas>(initial);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function patch(key: keyof Tarifas, raw: string) {
    setValues((v) => ({ ...v, [key]: raw === "" ? 0 : Number(raw) }));
  }

  function onSave() {
    setMessage(null);
    startTransition(async () => {
      try {
        await saveTarifas(values);
        setMessage({ text: "Tarifas guardadas. Se usarán en las próximas cotizaciones.", ok: true });
      } catch (e) {
        setMessage({ text: e instanceof Error ? e.message : "No se pudieron guardar las tarifas.", ok: false });
      }
    });
  }

  return (
    <div className="flex-1 px-7 py-8 max-w-[760px] w-full mx-auto">
      <div className="text-2xl font-extrabold text-[#0e2a43] mb-1.5">Tarifas</div>
      <div className="text-sm text-[#64748b] mb-[22px]">
        Valores usados para calcular todas las cotizaciones nuevas. Las cotizaciones ya guardadas no
        cambian.
      </div>

      {GRUPOS.map((grupo) => (
        <div key={grupo.titulo} className="bg-white border border-[#e2e8f0] rounded-xl p-[22px] mb-5">
          <div className="text-sm font-bold text-[#0e2a43] mb-1">{grupo.titulo}</div>
          {grupo.nota && <div className="text-xs text-[#94a3b8] mb-3.5">{grupo.nota}</div>}
          <div
            className={grupo.nota ? "grid gap-3.5" : "grid gap-3.5 mt-3.5"}
            style={{ gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))" }}
          >
            {grupo.campos.map((f) => (
              <div key={f.key}>
                <label className={lblStyle}>{f.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    value={values[f.key]}
                    onChange={(e) => patch(f.key, e.target.value)}
                    className={`${inputStyle} pr-20`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8]">
                    {f.suffix}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {message && (
        <div className={`mb-4 text-sm ${message.ok ? "text-[#166534]" : "text-[#991b1b]"}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          disabled={isPending}
          onClick={onSave}
          style={{
            background: isPending ? "#f1d9a6" : "#f5a623",
            cursor: isPending ? "not-allowed" : "pointer",
          }}
          className="text-[#0e2a43] border-0 rounded-lg px-[22px] py-3 text-sm font-bold"
        >
          {isPending ? "Guardando..." : "Guardar tarifas"}
        </button>
      </div>
    </div>
  );
}
