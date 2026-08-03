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

// The login credential is still a "username" internally, but the admin no
// longer types one — it's derived from the employee's email (now the field
// that actually identifies them) so the account can still log in.
function usernameSlugFromEmail(email: string): string {
  const local = email.split("@")[0].toLowerCase();
  const slug = local.replace(/[^a-z0-9._-]/g, "").slice(0, 30);
  return slug.length >= 3 ? slug : slug.padEnd(3, "0");
}

async function generateUniqueUsername(email: string): Promise<string> {
  const base = usernameSlugFromEmail(email);
  let candidate = base;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    suffix += 1;
    candidate = `${base}${suffix}`.slice(0, 30);
  }
  return candidate;
}

export async function createEmployee(raw: EmployeeCreateInput): Promise<{ id: string }> {
  await requireAdminForAction();
  const input = employeeCreateSchema.parse(raw);

  const username = await generateUniqueUsername(input.email);

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      username,
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
    email: string;
    role: "ADMIN" | "EMPLEADO";
    active: boolean;
    passwordHash?: string;
  } = {
    nombre: input.nombre,
    email: input.email,
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

export async function deleteEmployee(id: string): Promise<void> {
  const admin = await requireAdminForAction();

  if (admin.id === id) {
    throw new Error("No puedes eliminar tu propia cuenta.");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) throw new Error("Empleado no encontrado.");

  // Safety: never leave the system with zero admin accounts.
  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      throw new Error("Debe quedar al menos un administrador — no puedes eliminar el último.");
    }
  }

  // Quotes created by this user keep their frozen `vendedor` snapshot;
  // Quote.createdById is ON DELETE SET NULL so this never fails on quote history.
  await prisma.user.delete({ where: { id } });
  revalidatePath("/empleados");
}
