import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { fmtCLP, fmtDate, DIRECCION_LABEL, type Direccion } from "@/lib/pricing";
import { tipoLabelForQuote } from "@/lib/quote-view";
import FilterBar from "@/components/FilterBar";
import EstadoSelect from "@/components/EstadoSelect";
import type { Prisma } from "@prisma/client";

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; estado?: string; direccion?: string }>;
}) {
  const params = await searchParams;
  const cliente = params.cliente || "";
  const estado = params.estado || "todas";
  const direccion = params.direccion || "todas";

  const where: Prisma.QuoteWhereInput = {};
  if (estado !== "todas") where.estado = estado as Prisma.QuoteWhereInput["estado"];
  if (direccion !== "todas") where.direccion = direccion as Prisma.QuoteWhereInput["direccion"];
  if (cliente) {
    where.OR = [
      { cliente: { contains: cliente } },
      { numero: Number.isFinite(Number(cliente)) ? Number(cliente) : -1 },
    ];
  }

  const quotes = await prisma.quote.findMany({
    where,
    include: { items: { include: { vehiculos: true } } },
    orderBy: { numero: "desc" },
  });

  return (
    <div className="flex-1 px-7 py-8 max-w-[1280px] w-full mx-auto">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-[22px]">
        <div>
          <div className="text-2xl font-extrabold text-[#0e2a43]">Cotizaciones</div>
          <div className="text-sm text-[#64748b] mt-1">Embarques Valparaíso — Rapa Nui</div>
        </div>
        <Link
          href="/cotizaciones/nueva"
          className="bg-[#f5a623] text-[#0e2a43] rounded-lg px-[18px] py-3 text-sm font-bold"
        >
          + Nueva cotización
        </Link>
      </div>

      <FilterBar cliente={cliente} estado={estado} direccion={direccion} />

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[820px]">
            <thead>
              <tr className="bg-[#f8fafc] text-left">
                {["N°", "Cliente", "Ítems", "Tramo", "Fecha", "Total", "Estado", "Acciones"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs text-[#64748b] font-bold uppercase tracking-wide ${
                        i === 5 ? "text-right" : ""
                      }`}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {quotes.map((q) => (
                <tr key={q.id} className="border-t border-[#eef1f4]">
                  <td className="px-4 py-3.5 text-sm font-bold text-[#0e2a43]">{q.numero}</td>
                  <td className="px-4 py-3.5 text-sm">
                    <div className="font-semibold">{q.cliente}</div>
                    <div className="text-xs text-[#94a3b8]">{q.correo}</div>
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#334155] max-w-[220px]">
                    {tipoLabelForQuote(q)}
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-[#334155] whitespace-nowrap">
                    {DIRECCION_LABEL[q.direccion as Direccion]}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#475569]">{fmtDate(q.fecha)}</td>
                  <td className="px-4 py-3.5 text-sm font-bold text-right text-[#0e2a43]">
                    {fmtCLP(q.total)}
                  </td>
                  <td className="px-4 py-3.5">
                    <EstadoSelect id={q.id} estado={q.estado} />
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <Link
                      href={`/cotizaciones/${q.id}`}
                      className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-[7px] px-2.5 py-[7px] text-[13px] mr-1.5 inline-block"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/cotizaciones/${q.id}/editar`}
                      className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-[7px] px-2.5 py-[7px] text-[13px] mr-1.5 inline-block"
                    >
                      Editar
                    </Link>
                    <a
                      href={`/api/cotizaciones/${q.id}/pdf`}
                      className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-[7px] px-2.5 py-[7px] text-[13px] inline-block"
                    >
                      Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {quotes.length === 0 && (
          <div className="p-10 text-center text-[#94a3b8] text-sm">
            No hay cotizaciones que coincidan con el filtro.
          </div>
        )}
      </div>
    </div>
  );
}
