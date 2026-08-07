"use client";

import { TIPOS_META, TIPO_ORDER, fmtCLP, type Direccion, type Tarifas } from "@/lib/pricing";
import { itemStateToInput } from "./convert";
import { computeLineas } from "@/lib/pricing";
import type { ItemState } from "./types";

const lblStyle = "text-[13px] font-semibold text-[#374151] block mb-1.5";
const lblSmall = "text-[11px] font-semibold text-[#64748b] block mb-1";
const inputStyle =
  "w-full px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm outline-none font-[inherit]";

export default function ItemCard({
  item,
  direccion,
  tarifas,
  removeDisabled,
  onChange,
  onRemove,
}: {
  item: ItemState;
  direccion: Direccion;
  tarifas: Tarifas;
  removeDisabled: boolean;
  onChange: (patch: Partial<ItemState>) => void;
  onRemove: () => void;
}) {
  const isVehiculo = item.tipo === "vehiculo";
  const isCargaGeneral = item.tipo === "carga_general";
  const isCajon = item.tipo !== "vehiculo" && item.tipo !== "carga_general";

  const validRows = item.vehiculos.filter(
    (v) => Number(v.largo) > 0 && Number(v.ancho) > 0 && Number(v.alto) > 0
  );
  const vehiculosM3Total =
    Math.round(
      validRows.reduce((sum, v) => sum + Number(v.largo) * Number(v.ancho) * Number(v.alto), 0) * 100
    ) / 100;

  const subtotal = computeLineas(itemStateToInput(item), direccion, tarifas).reduce((s, l) => s + l.value, 0);

  const meta = TIPOS_META[item.tipo];

  return (
    <div className="border border-[#e2e8f0] rounded-[10px] p-4 mb-3.5 bg-[#fbfcfd]">
      <div className="flex justify-between items-center gap-2.5 mb-3.5 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          {TIPO_ORDER.map((tid) => {
            const m = TIPOS_META[tid];
            const selected = item.tipo === tid;
            return (
              <button
                key={tid}
                type="button"
                onClick={() => onChange({ tipo: tid })}
                style={{
                  borderColor: selected ? m.color : "#d7dee6",
                  background: selected ? m.color : "#fff",
                  color: selected ? "#fff" : "#475569",
                }}
                className="cursor-pointer rounded-[7px] px-3 py-1.5 text-xs font-bold border-[1.5px]"
              >
                {m.badge} · {m.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          disabled={removeDisabled}
          onClick={onRemove}
          style={{
            borderColor: removeDisabled ? "#eef1f4" : "#fecaca",
            color: removeDisabled ? "#c2cad3" : "#dc2626",
            cursor: removeDisabled ? "not-allowed" : "pointer",
          }}
          className="bg-transparent border rounded-[7px] px-3 py-1.5 text-xs"
        >
          Quitar ítem
        </button>
      </div>

      {isVehiculo && (
        <>
          <div className="text-xs text-[#94a3b8] mb-2.5">
            Ingresa largo, alto y ancho en metros por cada vehículo.
          </div>
          {item.vehiculos.map((v, i) => {
            const l = Number(v.largo) || 0;
            const a = Number(v.ancho) || 0;
            const h = Number(v.alto) || 0;
            const m3 = Math.round(l * a * h * 100) / 100;
            return (
              <div
                key={i}
                className="grid gap-2.5 items-end mb-2.5"
                style={{ gridTemplateColumns: "1fr 1fr 1fr 90px 34px" }}
              >
                <div>
                  <label className={lblSmall}>Largo (m)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={v.largo}
                    onChange={(e) => {
                      const arr = item.vehiculos.slice();
                      arr[i] = { ...arr[i], largo: e.target.value };
                      onChange({ vehiculos: arr });
                    }}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={lblSmall}>Alto (m)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={v.alto}
                    onChange={(e) => {
                      const arr = item.vehiculos.slice();
                      arr[i] = { ...arr[i], alto: e.target.value };
                      onChange({ vehiculos: arr });
                    }}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={lblSmall}>Ancho (m)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={v.ancho}
                    onChange={(e) => {
                      const arr = item.vehiculos.slice();
                      arr[i] = { ...arr[i], ancho: e.target.value };
                      onChange({ vehiculos: arr });
                    }}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label className={lblSmall}>m³</label>
                  <div className="py-2.5 font-bold text-[#0e2a43] text-sm">{m3}</div>
                </div>
                <button
                  type="button"
                  title="Quitar"
                  onClick={() => {
                    const arr = item.vehiculos.filter((_, j) => j !== i);
                    onChange({ vehiculos: arr.length ? arr : [{ largo: "", ancho: "", alto: "" }] });
                  }}
                  className="bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] rounded-[7px] h-[38px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => onChange({ vehiculos: item.vehiculos.concat([{ largo: "", ancho: "", alto: "" }]) })}
            className="bg-[#f1f4f7] border border-dashed border-[#cbd5e1] text-[#0e2a43] rounded-lg px-3.5 py-[9px] text-[13px] font-semibold cursor-pointer"
          >
            + Agregar vehículo
          </button>
          <div className="mt-2.5 text-[13px] text-[#475569]">
            Total: <b>{validRows.length}</b> vehículo(s) · <b>{vehiculosM3Total} m³</b>
          </div>
        </>
      )}

      {isCargaGeneral && (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <div>
            <label className={lblStyle}>Volumen (m³)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={item.cargaM3}
              onChange={(e) => onChange({ cargaM3: e.target.value })}
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>Descripción de la carga</label>
            <input
              value={item.cargaDesc}
              onChange={(e) => onChange({ cargaDesc: e.target.value })}
              placeholder="Ej: muebles y enseres"
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>Embalaje (costo aproximado)</label>
            <input
              type="number"
              min={0}
              step={1000}
              value={item.embalajeCosto}
              onChange={(e) => onChange({ embalajeCosto: e.target.value })}
              placeholder="Ej: 30000"
              className={inputStyle}
            />
          </div>
        </div>
      )}

      {isCajon && (
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
          <div>
            <label className={lblStyle}>
              {item.tipo === "contenedor10" ? "Cantidad de contenedores" : "Cantidad de cajones"}
            </label>
            <input
              type="number"
              min={1}
              value={item.cajonCantidad}
              onChange={(e) => onChange({ cajonCantidad: e.target.value })}
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>{item.tipo === "contenedor10" ? "Capacidad" : "Dimensiones del cajón"}</label>
            <div className="py-2.5 text-sm text-[#475569]">{meta.dims}</div>
          </div>
          <div>
            <label className={lblStyle}>Descripción (opcional)</label>
            <input
              value={item.cajonDesc}
              onChange={(e) => onChange({ cajonDesc: e.target.value })}
              placeholder="Ej: enseres varios"
              className={inputStyle}
            />
          </div>
        </div>
      )}

      <div className="mt-3.5 pt-3 border-t border-dashed border-[#dfe4ea] flex justify-between text-[13px] text-[#475569]">
        <div>Subtotal ítem</div>
        <div className="font-bold text-[#0e2a43]">{fmtCLP(subtotal)}</div>
      </div>
    </div>
  );
}
