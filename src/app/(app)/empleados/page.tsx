import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { fmtDate } from "@/lib/pricing";

export default async function EmpleadosPage() {
  await requireAdmin();

  const empleados = await prisma.user.findMany({
    orderBy: [{ active: "desc" }, { role: "asc" }, { nombre: "asc" }],
  });

  return (
    <div className="flex-1 px-7 py-8 max-w-[1100px] w-full mx-auto">
      <div className="flex justify-between items-end flex-wrap gap-4 mb-[22px]">
        <div>
          <div className="text-2xl font-extrabold text-[#0e2a43]">Empleados</div>
          <div className="text-sm text-[#64748b] mt-1">Usuarios con acceso al cotizador</div>
        </div>
        <Link
          href="/empleados/nuevo"
          className="bg-[#f5a623] text-[#0e2a43] rounded-lg px-[18px] py-3 text-sm font-bold"
        >
          + Nuevo empleado
        </Link>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-[#f8fafc] text-left">
                {["Usuario", "Nombre", "Correo", "Rol", "Estado", "Alta", "Acciones"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-xs text-[#64748b] font-bold uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {empleados.map((u) => (
                <tr key={u.id} className="border-t border-[#eef1f4]">
                  <td className="px-4 py-3.5 text-sm font-bold text-[#0e2a43]">{u.username}</td>
                  <td className="px-4 py-3.5 text-sm">{u.nombre}</td>
                  <td className="px-4 py-3.5 text-sm text-[#475569]">{u.email || "—"}</td>
                  <td className="px-4 py-3.5 text-[13px]">
                    <span
                      style={
                        u.role === "ADMIN"
                          ? { background: "#e0e7ff", color: "#3730a3" }
                          : { background: "#f1f5f9", color: "#475569" }
                      }
                      className="px-2 py-0.5 rounded-md text-xs font-bold"
                    >
                      {u.role === "ADMIN" ? "Administrador" : "Empleado"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-[13px]">
                    <span
                      style={
                        u.active
                          ? { background: "#dcfce7", color: "#166534" }
                          : { background: "#fee2e2", color: "#991b1b" }
                      }
                      className="px-2 py-0.5 rounded-md text-xs font-bold"
                    >
                      {u.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#475569]">{fmtDate(u.createdAt)}</td>
                  <td className="px-4 py-3.5">
                    <Link
                      href={`/empleados/${u.id}/editar`}
                      className="bg-transparent border border-[#d7dee6] text-[#0e2a43] rounded-[7px] px-2.5 py-[7px] text-[13px] inline-block"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
