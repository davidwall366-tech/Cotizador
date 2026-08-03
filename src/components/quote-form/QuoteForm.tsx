"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  agruparLineasPorItem,
  computeQuoteTotals,
  fmtCLP,
  itemValid,
  type QuoteItemInput,
  type Tarifas,
} from "@/lib/pricing";
import { createQuote, updateQuote } from "@/app/actions/quotes";
import { formatRut } from "@/lib/rut";
import ItemCard from "./ItemCard";
import { blankItemState, type QuoteFormState } from "./types";
import { formStateToPayload, itemStateToInput } from "./convert";

const lblStyle = "text-[13px] font-semibold text-[#374151] block mb-1.5";
const inputStyle =
  "w-full px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm outline-none font-[inherit]";

export default function QuoteForm({
  mode,
  quoteId,
  initial,
  isAdmin,
  tarifas,
}: {
  mode: "new" | "edit";
  quoteId?: string;
  initial: QuoteFormState;
  isAdmin: boolean;
  tarifas: Tarifas;
}) {
  const router = useRouter();
  const [form, setForm] = useState<QuoteFormState>(initial);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function patchForm(patch: Partial<QuoteFormState>) {
    setForm((f) => ({ ...f, ...patch }));
  }

  function patchItem(idx: number, patch: Partial<(typeof form.items)[number]>) {
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    }));
  }

  const itemInputs: QuoteItemInput[] = useMemo(
    () => form.items.map(itemStateToInput),
    [form.items]
  );
  const { lineas, total, abono } = useMemo(
    () => computeQuoteTotals(itemInputs, form.direccion, tarifas),
    [itemInputs, form.direccion, tarifas]
  );
  const grupos = useMemo(() => agruparLineasPorItem(lineas), [lineas]);

  const cannotSave =
    !form.cliente ||
    !form.correo ||
    form.items.length === 0 ||
    !form.items.every((it) => itemValid(itemStateToInput(it)));

  const plazoLabel = form.direccion === "vuelta" ? "Fecha de entrega en el puerto" : "Rango de entrega en bodega";

  async function onSave() {
    setError(null);
    const payload = formStateToPayload(form);
    startTransition(async () => {
      try {
        const result =
          mode === "edit" && quoteId
            ? await updateQuote(quoteId, payload)
            : await createQuote(payload);
        router.push(`/cotizaciones/${result.id}`);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar la cotización.");
      }
    });
  }

  return (
    <div className="flex-1 px-7 py-8 max-w-[920px] w-full mx-auto">
      <div className="text-2xl font-extrabold text-[#0e2a43] mb-[22px]">
        {mode === "edit" ? "Editar cotización" : "Nueva cotización"}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-[22px] mb-5">
        <div className="flex justify-between items-baseline flex-wrap gap-1.5 mb-3.5">
          <div className="text-sm font-bold text-[#0e2a43]">1. Ítems de la cotización</div>
          <div className="text-xs text-[#94a3b8]">
            Puedes combinar vehículos, cajones y carga general en la misma cotización.
          </div>
        </div>

        {form.items.map((it, idx) => (
          <ItemCard
            key={idx}
            item={it}
            direccion={form.direccion}
            tarifas={tarifas}
            removeDisabled={form.items.length <= 1}
            onChange={(patch) => patchItem(idx, patch)}
            onRemove={() => {
              if (form.items.length > 1) {
                patchForm({ items: form.items.filter((_, i) => i !== idx) });
              }
            }}
          />
        ))}

        <button
          type="button"
          onClick={() => patchForm({ items: form.items.concat([blankItemState("vehiculo")]) })}
          className="w-full bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-[#0e2a43] rounded-lg py-3 text-[13px] font-bold cursor-pointer"
        >
          + Agregar otro ítem
        </button>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-[22px] mb-5">
        <div className="text-sm font-bold text-[#0e2a43] mb-3.5">2. Datos del cliente y la cotización</div>
        <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
          <div>
            <label className={lblStyle}>Sentido del viaje</label>
            <select
              value={form.direccion}
              onChange={(e) => patchForm({ direccion: e.target.value as "ida" | "vuelta" })}
              className={`${inputStyle} bg-white`}
            >
              <option value="ida">Valparaíso → Rapa Nui</option>
              <option value="vuelta">Rapa Nui → Valparaíso</option>
            </select>
          </div>
          <div>
            <label className={lblStyle}>Nombre / Razón social</label>
            <input
              value={form.cliente}
              onChange={(e) => patchForm({ cliente: e.target.value })}
              placeholder="Ej: Juan Pérez"
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>RUT del cliente</label>
            <input
              value={form.clienteRut}
              onChange={(e) => patchForm({ clienteRut: formatRut(e.target.value) })}
              placeholder="Ej: 12.345.678-9"
              className={inputStyle}
            />
            <label className="flex items-center gap-1.5 text-xs text-[#64748b] mt-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.mostrarRut}
                onChange={(e) => patchForm({ mostrarRut: e.target.checked })}
              />
              Incluir el RUT en la cotización
            </label>
          </div>
          <div>
            <label className={lblStyle}>Dirección del cliente</label>
            <input
              value={form.clienteDireccion}
              onChange={(e) => patchForm({ clienteDireccion: e.target.value })}
              placeholder="Ej: Av. Siempre Viva 123, Valparaíso"
              className={inputStyle}
            />
            <label className="flex items-center gap-1.5 text-xs text-[#64748b] mt-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.mostrarDireccion}
                onChange={(e) => patchForm({ mostrarDireccion: e.target.checked })}
              />
              Incluir la dirección en la cotización
            </label>
          </div>
          <div>
            <label className={lblStyle}>Teléfono del cliente</label>
            <input
              value={form.clienteTelefono}
              onChange={(e) => patchForm({ clienteTelefono: e.target.value })}
              placeholder="Ej: +56 9 1234 5678"
              className={inputStyle}
            />
            <label className="flex items-center gap-1.5 text-xs text-[#64748b] mt-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.mostrarTelefono}
                onChange={(e) => patchForm({ mostrarTelefono: e.target.checked })}
              />
              Incluir el teléfono en la cotización
            </label>
          </div>
          <div>
            <label className={lblStyle}>Correo</label>
            <input
              value={form.correo}
              onChange={(e) => patchForm({ correo: e.target.value })}
              placeholder="cliente@correo.cl"
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>N° de cotización</label>
            <input
              value={form.numero}
              onChange={(e) => patchForm({ numero: e.target.value })}
              disabled={!isAdmin}
              readOnly={!isAdmin}
              className={
                isAdmin ? inputStyle : `${inputStyle} bg-[#f1f5f9] text-[#64748b] cursor-not-allowed`
              }
            />
            {!isAdmin && (
              <div className="text-xs text-[#94a3b8] mt-1">
                Se asigna automáticamente. Solo un administrador puede cambiarlo.
              </div>
            )}
          </div>
          <div>
            <label className={lblStyle}>Fecha de emisión</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => patchForm({ fecha: e.target.value })}
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>Vigencia (días)</label>
            <input
              type="number"
              min={1}
              value={form.vigenciaDias}
              onChange={(e) => patchForm({ vigenciaDias: e.target.value })}
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>Usuario</label>
            <input
              value={form.vendedor}
              disabled
              readOnly
              className={`${inputStyle} bg-[#f1f5f9] text-[#64748b] cursor-not-allowed`}
            />
            <div className="text-xs text-[#94a3b8] mt-1">
              Se completa solo con tu usuario y no se puede editar.
            </div>
          </div>
          <div>
            <label className={lblStyle}>N° de viaje</label>
            <input
              value={form.viajeN}
              onChange={(e) => patchForm({ viajeN: e.target.value })}
              placeholder="Ej: 160"
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>Zarpe estimado</label>
            <input
              value={form.zarpe}
              onChange={(e) => patchForm({ zarpe: e.target.value })}
              placeholder="Ej: Finales de septiembre"
              className={inputStyle}
            />
          </div>
          <div>
            <label className={lblStyle}>{plazoLabel}</label>
            <input
              value={form.plazoRecepcion}
              onChange={(e) => patchForm({ plazoRecepcion: e.target.value })}
              placeholder="Ej: Principios de septiembre"
              className={inputStyle}
            />
          </div>
        </div>
        <div className="mt-3.5">
          <label className={lblStyle}>Notas / observaciones</label>
          <textarea
            value={form.notas}
            onChange={(e) => patchForm({ notas: e.target.value })}
            placeholder="Observaciones internas o para el cliente"
            className={`${inputStyle} min-h-[70px] resize-y`}
          />
        </div>
      </div>

      <div className="bg-[#fff8ec] border border-[#f5d99a] rounded-xl p-[22px] mb-[22px]">
        <div className="text-sm font-bold text-[#0e2a43] mb-3.5">Resumen de costos (exentos de IVA)</div>
        {grupos.map((g, gi) => (
          <div key={gi}>
            {g.lineas.map((l, li) => (
              <div key={li} className="flex justify-between text-sm text-[#374151] py-1.5">
                <div>{l.label}</div>
                <div className="font-semibold">{fmtCLP(l.value)}</div>
              </div>
            ))}
            {g.lineas.length > 1 && (
              <div className="flex justify-between text-[13px] text-[#8a6d1f] font-bold pt-0.5 pb-1.5">
                <div>Subtotal ítem</div>
                <div>{fmtCLP(g.subtotal)}</div>
              </div>
            )}
            <div className="border-b-2 border-[#e8c877] mb-1.5" />
          </div>
        ))}
        <div className="flex justify-between text-base text-[#0e2a43] pt-3 pb-1 font-extrabold">
          <div>VALOR TOTAL</div>
          <div>{fmtCLP(total)}</div>
        </div>
        <div className="flex justify-between text-[13px] text-[#8a6d1f]">
          <div>Abono del 50% para reserva</div>
          <div>{fmtCLP(abono)}</div>
        </div>
      </div>

      {error && <div className="mb-4 text-sm text-[#991b1b]">{error}</div>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/cotizaciones")}
          className="bg-transparent border border-[#d7dee6] text-[#374151] rounded-lg px-5 py-3 text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={cannotSave || isPending}
          onClick={onSave}
          style={{
            background: cannotSave || isPending ? "#f1d9a6" : "#f5a623",
            cursor: cannotSave || isPending ? "not-allowed" : "pointer",
          }}
          className="text-[#0e2a43] border-0 rounded-lg px-[22px] py-3 text-sm font-bold"
        >
          {isPending ? "Guardando..." : "Guardar y ver documento"}
        </button>
      </div>
    </div>
  );
}
