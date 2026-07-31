"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FilterBar({
  cliente,
  estado,
  direccion,
}: {
  cliente: string;
  estado: string;
  direccion: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "todas") params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 px-[18px] mb-[18px] flex gap-3.5 flex-wrap items-center">
      <input
        defaultValue={cliente}
        onChange={(e) => setParam("cliente", e.target.value)}
        placeholder="Buscar por cliente o N°..."
        className="flex-1 basis-60 px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm outline-none"
      />
      <select
        defaultValue={estado}
        onChange={(e) => setParam("estado", e.target.value)}
        className="px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm bg-white min-w-[160px]"
      >
        <option value="todas">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="aprobada">Aprobada</option>
        <option value="rechazada">Rechazada</option>
      </select>
      <select
        defaultValue={direccion}
        onChange={(e) => setParam("direccion", e.target.value)}
        className="px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm bg-white min-w-[200px]"
      >
        <option value="todas">Todos los tramos</option>
        <option value="ida">Valparaíso → Rapa Nui</option>
        <option value="vuelta">Rapa Nui → Valparaíso</option>
      </select>
    </div>
  );
}
