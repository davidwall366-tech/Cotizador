"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdminForAction } from "@/lib/admin-guard";
import {
  employeeCreateSchema,
  employeeUpdateSchema,
  type EmployeeCreateInput,
  type EmployeeUpdateInput,
} from "@/lib/employee-schema";

export async function createEmployee(raw: EmployeeCreateInput): Promise<{ id: string }> {
  await requireAdminForAction();
  const input = employeeCreateSchema.parse(raw);

  const existing = await prisma.user.findUnique({ where: { username: input.username } });
  if (existing) {
    throw new Error(`El usuario "${input.username}" ya existe.`);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      nombre: input.nombre,
      email: input.email,
      role: input.role,
      passwordHash,
    },
  });

  revalidatePath("/empleados");
  return { id: user.id };
}

export async function updateEmployee(id: string, raw: EmployeeUpdateInput): Promise<void> {
  const admin = await requireAdminForAction();
  const input = employeeUpdateSchema.parse(raw);

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("Empleado no encontrado.");

  // Safety: admin can't remove their own admin role or deactivate themselves.
  // Prevents a locked-out admin state if there's only one admin.
  const changingSelf = admin.id === id;
  if (changingSelf && (input.role !== "ADMIN" || !input.active)) {
    throw new Error("No puedes quitarte tu propio rol de administrador ni desactivarte.");
  }

  const data: {
    nombre: string;
    email: string | null;
    role: "ADMIN" | "EMPLEADO";
    active: boolean;
    passwordHash?: string;
  } = {
    nombre: input.nombre,
    email: input.email ?? null,
    role: input.role,
    active: input.active,
  };

  if (input.password) {
    data.passwordHash = await bcrypt.hash(input.password, 12);
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/empleados");
  revalidatePath(`/empleados/${id}/editar`);
}
