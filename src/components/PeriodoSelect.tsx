"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PERIODOS } from "@/lib/estadisticas";

export default function PeriodoSelect({ periodo }: { periodo: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setPeriodo(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "12m") params.set("periodo", value);
    else params.delete("periodo");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <select
      defaultValue={periodo}
      onChange={(e) => setPeriodo(e.target.value)}
      className="px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm bg-white min-w-[180px]"
    >
      {PERIODOS.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );
}
