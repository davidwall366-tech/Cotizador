import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { fmtCLP, fmtDate, DIRECCION_LABEL, type Direccion } from "@/lib/pricing";
import { tipoLabelForQuote } from "@/lib/quote-view";
import FilterBar from "@/components/FilterBar";
import EstadoSelect from "@/components/EstadoSelect";
import DeleteQuoteButton from "@/components/DeleteQuoteButton";
import type { Prisma } from "@prisma/client";

// Case- and accent-insensitive: "José", "jose", "JOSÉ" all match "jose".
// Strips combining diacritical marks (U+0300-U+036F) left behind by NFD
// decomposition, by code point rather than a regex range literal.
function normalize(s: string): string {
  return Array.from(s.normalize("NFD"))
    .filter((ch) => {
      const code = ch.codePointAt(0) ?? 0;
      return code < 0x300 || code > 0x36f;
    })
    .join("")
    .toLowerCase();
}

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; estado?: string; direccion?: string }>;
}) {
  const params = await searchParams;
  const cliente = params.cliente || "";
  const estado = params.estado || "todas";
  const direccion = params.direccion || "todas";

  const [session, where] = await Promise.all([
    auth(),
    Promise.resolve<Prisma.QuoteWhereInput>({
      ...(estado !== "todas" ? { estado: estado as Prisma.QuoteWhereInput["estado"] } : {}),
      ...(direccion !== "todas" ? { direccion: direccion as Prisma.QuoteWhereInput["direccion"] } : {}),
    }),
  ]);
  const isAdmin = session?.user?.role === "ADMIN";

  let quotes = await prisma.quote.findMany({
    where,
    include: { items: { include: { vehiculos: true } } },
    orderBy: { numero: "desc" },
  });

  if (cliente) {
    const needle = normalize(cliente);
    const asNumero = Number.isFinite(Number(cliente)) ? Number(cliente) : null;
    quotes = quotes.filter(
      (q) => normalize(q.cliente).includes(needle) || (asNumero !== null && q.numero === asNumero)
    );
  }

  return (
    <div className="flex-1 px-7 py-8 max-w-[1280px] w-full mx-auto">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-[22px]">
        <div>
          <div className="text-2xl font-extrabold text-[#0e2a43]">Cotizaciones</div>
          <div className="text-sm text-[#64748b] mt-1">Transporte Marítimo</div>
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
                {["N°", "Cliente", "Ítems", "Tramo", "N° Viaje", "Fecha", "Total", "Estado", "Acciones"].map(
                  (h, i) => (
                    <th
                      key={h}
                      className={`px-4 py-3 text-xs text-[#64748b] font-bold uppercase tracking-wide ${
                        i === 6 ? "text-right" : ""
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
                  <td className="px-4 py-3.5 text-sm text-[#475569] whitespace-nowrap">
                    {q.viajeN || "—"}
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
                      className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-[7px] px-2.5 py-[7px] text-[13px] mr-1.5 inline-block"
                    >
                      Descargar
                    </a>
                    {isAdmin && <DeleteQuoteButton id={q.id} numero={q.numero} />}
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
