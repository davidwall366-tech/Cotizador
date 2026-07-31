import { z } from "zod";

// Usernames: lowercase letters/numbers/dot/underscore/hyphen, 3-30 chars.
// Keeps them URL/filename safe and matches the "ej: dsalinas" login placeholder.
const usernameRegex = /^[a-z0-9._-]{3,30}$/;

export const employeeCreateSchema = z.object({
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(usernameRegex, "Usuario inválido: usa 3-30 caracteres en minúscula, números, punto, guion o guion bajo."),
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128),
  role: z.enum(["ADMIN", "EMPLEADO"]).default("EMPLEADO"),
});

export const employeeUpdateSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  email: z
    .string()
    .trim()
    .email("Correo inválido")
    .optional()
    .or(z.literal("").transform(() => undefined)),
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
