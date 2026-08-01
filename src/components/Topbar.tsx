"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

function navBtnClass(active: boolean) {
  return [
    "border rounded-[7px] px-3.5 py-2 text-[13px] font-bold cursor-pointer transition-colors",
    active
      ? "bg-[#f5a623] text-[#0e2a43] border-[#f5a623]"
      : "bg-transparent text-[#dbe6ef] border-[#2c4d6b] hover:bg-white/5",
  ].join(" ");
}

export default function Topbar({ nombre, isAdmin }: { nombre: string; isAdmin: boolean }) {
  const pathname = usePathname();
  const isList = pathname === "/cotizaciones";
  const isNew = pathname?.startsWith("/cotizaciones/nueva");
  const isEmpleados = pathname?.startsWith("/empleados");

  return (
    <div className="no-print bg-[#0e2a43] text-white px-7 py-3 min-h-16 flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Image
          src="/assets/logo-icon.png"
          alt="Naviera GV"
          width={38}
          height={38}
          unoptimized
          className="object-contain bg-white rounded-lg p-0.5"
        />
        <div className="text-[17px] font-extrabold tracking-wide">
          Naviera GV <span className="font-medium text-[#9fb4c7]">· Cotizador</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Link href="/cotizaciones" className={navBtnClass(isList)}>
          Cotizaciones
        </Link>
        <Link href="/cotizaciones/nueva" className={navBtnClass(!!isNew)}>
          + Nueva cotización
        </Link>
        {isAdmin && (
          <Link href="/empleados" className={navBtnClass(!!isEmpleados)}>
            Empleados
          </Link>
        )}
      </div>
      <div className="flex items-center gap-3.5">
        <div className="text-sm text-[#dbe6ef]">{nombre}</div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="bg-transparent border border-[#2c4d6b] text-[#cfe0ee] rounded-[7px] px-3 py-2 text-[13px] cursor-pointer hover:bg-white/5"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
