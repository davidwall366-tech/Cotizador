import Image from "next/image";
import { agruparLineasPorItem, fmtCLP } from "@/lib/pricing";
import type { QuoteDocumentViewModel } from "@/lib/quote-view";

// Keeps each numbered section's heading glued to its content when the PDF
// paginates — without this, Chrome/Puppeteer can leave a heading stranded at
// the bottom of one page with its content starting on the next.
const sectionStyle = { breakInside: "avoid", pageBreakInside: "avoid" } as const;

export default function QuoteDocument({ vm }: { vm: QuoteDocumentViewModel }) {
  return (
    <div className="w-full max-w-[760px] bg-white rounded-[10px] shadow-[0_1px_3px_rgba(15,35,55,0.08)] overflow-hidden">
      <div className="bg-[#0e2a43] px-[34px] py-[26px] flex items-center justify-between flex-wrap gap-4">
        <Image
          src="/assets/logo-naviera-gv.jpg"
          alt="Naviera GV"
          width={56}
          height={56}
          unoptimized
          className="h-14 w-auto bg-white rounded-lg p-1.5"
        />
        <div className="text-right text-[#dbe6ef] text-xs leading-relaxed">
          <div className="text-white font-bold text-sm">Naviera GV S.A.</div>
          <div>RUT 76.015.455-5</div>
          <div>Transporte marítimo</div>
          <div>info@navieragv.cl</div>
        </div>
      </div>
      <div className="h-[5px]" style={{ background: "linear-gradient(90deg,#f5a623,#1f6fb8)" }} />

      <div className="p-[34px]">
        <div className="flex justify-between items-start flex-wrap gap-3.5 mb-[22px]">
          <div>
            <div className="flex items-baseline gap-2.5 flex-wrap">
              <div className="text-xl font-extrabold text-[#0e2a43]">Cotización N° {vm.numero}</div>
              <div className="text-[13px] text-[#64748b]">Emitida el {vm.fecha}</div>
            </div>
            <div className="text-[13px] text-[#64748b] mt-1">{vm.tipoLabel}</div>
          </div>
          <div
            style={{ background: vm.estado.bg, color: vm.estado.fg }}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold h-fit"
          >
            {vm.estado.label}
          </div>
        </div>

        <p className="text-sm leading-[1.7] text-[#334155]">
          Estimado/a <b>{vm.cliente}</b>,
        </p>
        <div className="text-sm leading-[1.6] text-[#334155] mb-3">
          {vm.mostrarRut && vm.clienteRut && <div>RUT: {vm.clienteRut}</div>}
          {vm.mostrarDireccion && vm.clienteDireccion && <div>Dirección: {vm.clienteDireccion}</div>}
          {vm.mostrarTelefono && vm.clienteTelefono && <div>Teléfono: {vm.clienteTelefono}</div>}
          {vm.correo && <div>Correo: {vm.correo}</div>}
        </div>
        <p className="text-sm leading-[1.7] text-[#334155]">
          Junto con saludarle, adjunto la cotización formal para {vm.intro}. Los detalles, así como
          las condiciones comerciales y operacionales, se detallan a continuación:
        </p>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">
            1. Resumen de la cotización (Viaje N° {vm.viajeN})
          </div>
          <div className="text-sm text-[#334155] leading-[1.9]">
            Ruta: {vm.direccionLabel}
            <br />
            Zarpe estimado: {vm.zarpe}
            <br />
            Tiempo de navegación: 11 días
            <br />
            Vigencia de la cotización: {vm.vigenciaDias} días desde su emisión
          </div>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">
            2. Detalle de valores (exentos de IVA)
          </div>
          <div className="border border-[#eef1f4] rounded-lg overflow-hidden">
            {agruparLineasPorItem(vm.lineas).map((g, gi) => (
              <div key={gi}>
                {g.lineas.map((l, li) => (
                  <div key={li} className="flex justify-between px-4 py-2.5 text-[13px] border-b border-[#eef1f4]">
                    <div className="text-[#334155]">{l.label}</div>
                    <div className="font-semibold text-[#0e2a43]">{fmtCLP(l.value)}</div>
                  </div>
                ))}
                {g.lineas.length > 1 && (
                  <div className="flex justify-between px-4 py-2 text-xs bg-[#fafbfc] border-b border-[#eef1f4] font-bold text-[#0e2a43]">
                    <div>Subtotal ítem</div>
                    <div>{fmtCLP(g.subtotal)}</div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 text-sm bg-[#f8fafc] font-extrabold text-[#0e2a43]">
              <div>VALOR TOTAL</div>
              <div>{fmtCLP(vm.total)}</div>
            </div>
            <div className="flex justify-between px-4 py-2.5 text-xs text-[#64748b]">
              <div>Abono del 50% para reserva</div>
              <div>{fmtCLP(vm.abono)}</div>
            </div>
          </div>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">3. El servicio incluye</div>
          <ul className="text-sm text-[#334155] leading-[1.8] pl-5 m-0 list-disc">
            {vm.incluye.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">4. Datos de pago para reserva</div>
          <div className="text-sm text-[#334155] leading-[1.9]">
            Razón Social: Naviera GV SA
            <br />
            RUT: 76.015.455-5
            <br />
            Banco: Santander — Cuenta Corriente N° 63257249
            <br />
            Correo de confirmación: info@navieragv.cl
          </div>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">5. Condiciones</div>
          <ul className="text-[13px] text-[#475569] leading-[1.8] pl-5 m-0 list-disc">
            {vm.condiciones.map((c, i) => (
              <li
                key={i}
                style={
                  c.highlight
                    ? {
                        fontWeight: 700,
                        color: "#92400e",
                        background: "#fff7e6",
                        borderRadius: 6,
                        padding: "6px 10px",
                        margin: "4px 0",
                        display: "block",
                      }
                    : undefined
                }
              >
                {c.text}
              </li>
            ))}
          </ul>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">{vm.logisticaTitulo}</div>
          {vm.esVuelta ? (
            <p className="text-sm text-[#334155] leading-[1.7] m-0">
              La carga se debe entregar en el muelle de Hanga Piko previa coordinación.
            </p>
          ) : (
            <ul className="text-sm text-[#334155] leading-[1.9] pl-5 m-0 list-disc">
              <li>
                Lugar: Av. Los Carrera 01948, sector Paso Hondo, paradero 32, Quilpué. (Fono: +56 9 7519
                4982).
                <br />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Naviera+GV"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1f6fb8] font-semibold inline-flex items-center gap-1"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.5 7.5 12.5 7.5 12.5s7.5-7 7.5-12.5C19.5 5.36 16.14 2 12 2z"
                      fill="#EA4335"
                    />
                    <circle cx="12" cy="9.5" r="2.75" fill="#ffffff" />
                  </svg>
                  Ver en Google Maps
                </a>
                {" · "}
                <a
                  href="https://waze.com/ul?q=Naviera%20GV&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1f6fb8] font-semibold inline-flex items-center gap-1"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#33CCFF" />
                    <circle cx="8.7" cy="10.5" r="1.3" fill="#0e2a43" />
                    <circle cx="15.3" cy="10.5" r="1.3" fill="#0e2a43" />
                    <path
                      d="M7.5 14.5c1 1.3 2.6 2 4.5 2s3.5-.7 4.5-2"
                      stroke="#0e2a43"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  Ver en Waze
                </a>
              </li>
              <li>
                {vm.plazoRecepcionLabel}: {vm.plazoRecepcion}.
              </li>
              <li>Horarios: De lunes a jueves de 8:45 a 12:30 hrs y viernes de 8:45 a 12:30 hrs.</li>
              <li>
                Confirmación: es obligatorio confirmar antes de despachar. Los itinerarios pueden sufrir
                variaciones por clima. Puede revisar las fechas actualizadas en navieragv.com.
              </li>
            </ul>
          )}
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">
            8. Deslinde de responsabilidad (SASIPA)
          </div>
          <p className="text-sm text-[#334155] leading-[1.7] m-0">
            Naviera GV no se hace responsable por eventuales daños causados durante las maniobras de
            descarga y manipulación ejecutadas por la empresa SASIPA en Rapa Nui.
          </p>
        </div>

        <div style={sectionStyle}>
          <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">
            9. Datos requeridos para formalizar el ingreso
          </div>
          <div className="text-sm text-[#334155] leading-[1.9]">
            Nombre completo · RUT · Dirección · Teléfono · Correo electrónico
          </div>
        </div>

        {vm.notas && (
          <div style={sectionStyle}>
            <div className="text-sm font-bold text-[#0e2a43] my-[22px] mb-2.5">Notas</div>
            <div className="text-sm text-[#334155]">{vm.notas}</div>
          </div>
        )}

        <div style={sectionStyle} className="mt-[30px] pt-[18px] border-t border-[#eef1f4] text-[13px] text-[#64748b]">
          Quedamos atentos a sus comentarios.
          <br />
          Atentamente,
          <br />
          <b className="text-[#0e2a43]">{vm.vendedor}</b>
          <br />
          Naviera GV S.A. · +56 9 7512 4982
        </div>
      </div>
    </div>
  );
}
