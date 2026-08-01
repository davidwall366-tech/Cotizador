"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createEmployee, updateEmployee } from "@/app/actions/employees";

const lblStyle = "text-[13px] font-semibold text-[#374151] block mb-1.5";
const inputStyle =
  "w-full px-3 py-2.5 border border-[#d7dee6] rounded-lg text-sm outline-none font-[inherit]";

export interface EmployeeFormInitial {
  nombre?: string;
  email?: string;
  role?: "ADMIN" | "EMPLEADO";
  active?: boolean;
}

export default function EmployeeForm({
  mode,
  employeeId,
  initial,
  isSelf,
}: {
  mode: "new" | "edit";
  employeeId?: string;
  initial: EmployeeFormInitial;
  isSelf?: boolean;
}) {
  const router = useRouter();
  const [nombre, setNombre] = useState(initial.nombre || "");
  const [email, setEmail] = useState(initial.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"ADMIN" | "EMPLEADO">(initial.role || "EMPLEADO");
  const [active, setActive] = useState(initial.active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const passwordsMatch = password === confirmPassword;

  const canSubmit =
    mode === "new"
      ? nombre.length > 0 && email.length > 0 && password.length >= 8 && passwordsMatch
      : nombre.length > 0 &&
        email.length > 0 &&
        (password.length === 0 || (password.length >= 8 && passwordsMatch));

  async function onSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "edit" && employeeId) {
          await updateEmployee(employeeId, { nombre, email, role, active, password });
        } else {
          await createEmployee({ nombre, email, password, role });
        }
        router.push("/empleados");
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo guardar el empleado.");
      }
    });
  }

  return (
    <div className="flex-1 px-7 py-8 max-w-[640px] w-full mx-auto">
      <div className="text-2xl font-extrabold text-[#0e2a43] mb-[22px]">
        {mode === "edit" ? "Editar empleado" : "Nuevo empleado"}
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl p-[22px] mb-5 flex flex-col gap-4">
        <div>
          <label className={lblStyle}>Nombre y apellido</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Rodrigo Guarda"
            className={inputStyle}
          />
          <div className="text-xs text-[#94a3b8] mt-1">
            Nombre completo, para identificar al empleado en el sistema.
          </div>
        </div>

        <div>
          <label className={lblStyle}>Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="empleado@navieragv.cl"
            className={inputStyle}
          />
          <div className="text-xs text-[#94a3b8] mt-1">
            Obligatorio: recibe las notificaciones del sistema (alertas de vencimiento, copias de cotizaciones enviadas).
          </div>
        </div>

        <div>
          <label className={lblStyle}>
            {mode === "edit" ? "Nueva contraseña (dejar en blanco para no cambiar)" : "Contraseña"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              className={`${inputStyle} pr-14`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1f6fb8] cursor-pointer"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div>
          <label className={lblStyle}>
            {mode === "edit" ? "Confirmar nueva contraseña" : "Confirmar contraseña"}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
              className={`${inputStyle} pr-14`}
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1f6fb8] cursor-pointer"
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
          {!passwordsMatch && confirmPassword.length > 0 && (
            <div className="text-xs text-[#dc2626] mt-1">Las contraseñas no coinciden.</div>
          )}
        </div>

        <div>
          <label className={lblStyle}>Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "EMPLEADO")}
            disabled={mode === "edit" && isSelf}
            className={`${inputStyle} bg-white`}
          >
            <option value="EMPLEADO">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {mode === "edit" && isSelf && (
            <div className="text-xs text-[#94a3b8] mt-1">
              No puedes cambiar tu propio rol.
            </div>
          )}
        </div>

        {mode === "edit" && (
          <div>
            <label className="flex items-center gap-2 text-sm text-[#374151]">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                disabled={isSelf}
              />
              Activo (puede iniciar sesión)
            </label>
            {isSelf && (
              <div className="text-xs text-[#94a3b8] mt-1">
                No puedes desactivarte a ti mismo.
              </div>
            )}
          </div>
        )}
      </div>

      {error && <div className="mb-4 text-sm text-[#991b1b]">{error}</div>}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.push("/empleados")}
          className="bg-transparent border border-[#d7dee6] text-[#374151] rounded-lg px-5 py-3 text-sm cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={!canSubmit || isPending}
          onClick={onSubmit}
          style={{
            background: !canSubmit || isPending ? "#f1d9a6" : "#f5a623",
            cursor: !canSubmit || isPending ? "not-allowed" : "pointer",
          }}
          className="text-[#0e2a43] border-0 rounded-lg px-[22px] py-3 text-sm font-bold"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
