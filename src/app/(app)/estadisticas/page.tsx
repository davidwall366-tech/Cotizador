import { prisma } from "@/lib/prisma";
import { fmtCLP } from "@/lib/pricing";
import { computeEstadisticas, rangoDesde } from "@/lib/estadisticas";
import PeriodoSelect from "@/components/PeriodoSelect";
import BarChart from "@/components/BarChart";
import EstadoBreakdown from "@/components/EstadoBreakdown";

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
      <div className="text-xs text-[#64748b] font-bold uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-extrabold text-[#0e2a43]">{value}</div>
      {hint && <div className="text-xs text-[#94a3b8] mt-1">{hint}</div>}
    </div>
  );
}

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const params = await searchParams;
  const periodo = params.periodo || "12m";
  const desde = rangoDesde(periodo);

  const quotes = await prisma.quote.findMany({
    where: { fecha: { gte: desde } },
    select: { fecha: true, estado: true, total: true },
  });

  const stats = computeEstadisticas(quotes, desde);
  const decididas = stats.porEstado.aprobada + stats.porEstado.rechazada;
  const tasaLabel = stats.tasaAprobacion === null ? "—" : `${Math.round(stats.tasaAprobacion * 100)}%`;

  return (
    <div className="flex-1 px-7 py-8 max-w-[1280px] w-full mx-auto">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-[22px]">
        <div>
          <div className="text-2xl font-extrabold text-[#0e2a43]">Estadísticas</div>
          <div className="text-sm text-[#64748b] mt-1">
            Cotizaciones, tasa de aprobación y volumen por período
          </div>
        </div>
        <PeriodoSelect periodo={periodo} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-[18px]">
        <StatTile label="Cotizaciones" value={stats.totalCotizaciones.toLocaleString("es-CL")} />
        <StatTile
          label="Tasa de aprobación"
          value={tasaLabel}
          hint={`${decididas.toLocaleString("es-CL")} decididas`}
        />
        <StatTile label="Monto cotizado" value={fmtCLP(stats.montoTotal)} />
        <StatTile label="Ticket promedio" value={fmtCLP(stats.ticketPromedio)} />
      </div>

      <EstadoBreakdown porEstado={stats.porEstado} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-[18px]">
        <BarChart
          title="Cotizaciones por mes"
          data={stats.meses.map((m) => ({ key: m.key, label: m.label, value: m.cotizaciones }))}
          format="count"
        />
        <BarChart
          title="Monto cotizado por mes"
          data={stats.meses.map((m) => ({ key: m.key, label: m.label, value: m.monto }))}
          format="clp"
        />
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mt-[18px]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[560px]">
            <thead>
              <tr className="bg-[#f8fafc] text-left">
                {["Mes", "Cotizaciones", "Aprobadas", "Monto cotizado"].map((h, i) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs text-[#64748b] font-bold uppercase tracking-wide ${
                      i > 0 ? "text-right" : ""
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.meses.map((m) => (
                <tr key={m.key} className="border-t border-[#eef1f4]">
                  <td className="px-4 py-3 text-sm font-semibold text-[#0e2a43]">{m.label}</td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-[#334155]">
                    {m.cotizaciones.toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums text-[#334155]">
                    {m.aprobadas.toLocaleString("es-CL")}
                  </td>
                  <td className="px-4 py-3 text-sm text-right tabular-nums font-bold text-[#0e2a43]">
                    {fmtCLP(m.monto)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stats.meses.length === 0 && (
          <div className="p-10 text-center text-[#94a3b8] text-sm">Sin datos en este período.</div>
        )}
      </div>
    </div>
  );
}
