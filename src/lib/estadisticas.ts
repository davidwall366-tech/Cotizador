import type { Estado } from "@prisma/client";

export interface QuoteForStats {
  fecha: Date;
  estado: Estado;
  total: number;
}

export interface MonthBucket {
  key: string;
  label: string;
  cotizaciones: number;
  aprobadas: number;
  monto: number;
}

export interface Estadisticas {
  totalCotizaciones: number;
  porEstado: Record<Estado, number>;
  tasaAprobacion: number | null;
  montoTotal: number;
  montoAprobado: number;
  ticketPromedio: number;
  meses: MonthBucket[];
}

const MES_LABEL = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const PERIODOS = [
  { value: "6m", label: "Últimos 6 meses" },
  { value: "12m", label: "Últimos 12 meses" },
  { value: "24m", label: "Últimos 24 meses" },
  { value: "todo", label: "Todo" },
] as const;

function mesesDelPeriodo(periodo: string): number | null {
  const meses = { "6m": 6, "12m": 12, "24m": 24 }[periodo];
  return meses ?? null;
}

// null means "sin límite inferior" (periodo "todo").
// `fecha` is stored as a UTC date-only value (see fmtDate in pricing.ts, which
// reads it via toISOString() for the same reason) — every month calculation
// here must use the UTC getters, or dates shift a day/month in local time.
export function rangoDesde(periodo: string, ahora = new Date()): Date | null {
  const meses = mesesDelPeriodo(periodo);
  if (meses === null) return null;
  return new Date(Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth() - (meses - 1), 1));
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function computeEstadisticas(
  quotes: QuoteForStats[],
  desde: Date | null,
  hasta = new Date()
): Estadisticas {
  const porEstado: Record<Estado, number> = { pendiente: 0, aprobada: 0, rechazada: 0 };
  let montoTotal = 0;
  let montoAprobado = 0;

  const primeraFecha = quotes.reduce<Date | null>(
    (min, q) => (min === null || q.fecha < min ? q.fecha : min),
    null
  );
  const inicio = desde ?? primeraFecha ?? hasta;
  const inicioMes = new Date(Date.UTC(inicio.getUTCFullYear(), inicio.getUTCMonth(), 1));
  const finMes = new Date(Date.UTC(hasta.getUTCFullYear(), hasta.getUTCMonth(), 1));

  const buckets = new Map<string, MonthBucket>();
  const cursor = new Date(inicioMes);
  while (cursor <= finMes) {
    buckets.set(monthKey(cursor), {
      key: monthKey(cursor),
      label: `${MES_LABEL[cursor.getUTCMonth()]} ${cursor.getUTCFullYear()}`,
      cotizaciones: 0,
      aprobadas: 0,
      monto: 0,
    });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }

  for (const q of quotes) {
    porEstado[q.estado] += 1;
    montoTotal += q.total;
    if (q.estado === "aprobada") montoAprobado += q.total;

    const bucket = buckets.get(monthKey(q.fecha));
    if (bucket) {
      bucket.cotizaciones += 1;
      bucket.monto += q.total;
      if (q.estado === "aprobada") bucket.aprobadas += 1;
    }
  }

  const decididas = porEstado.aprobada + porEstado.rechazada;

  return {
    totalCotizaciones: quotes.length,
    porEstado,
    tasaAprobacion: decididas > 0 ? porEstado.aprobada / decididas : null,
    montoTotal,
    montoAprobado,
    ticketPromedio: quotes.length > 0 ? montoTotal / quotes.length : 0,
    meses: Array.from(buckets.values()),
  };
}
