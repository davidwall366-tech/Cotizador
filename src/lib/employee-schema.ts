import { z } from "zod";

export const employeeCreateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z.string().trim().toLowerCase().min(1, "El correo es obligatorio").email("Correo inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
  role: z.enum(["ADMIN", "EMPLEADO"]).default("EMPLEADO"),
});

export const employeeUpdateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z.string().trim().toLowerCase().min(1, "El correo es obligatorio").email("Correo inválido"),
  role: z.enum(["ADMIN", "EMPLEADO"]),
  active: z.boolean(),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128)
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
