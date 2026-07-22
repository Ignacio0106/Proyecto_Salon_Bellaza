import { z } from "zod";
import { Rol } from "../../generated/prisma/enums";


export const registerUserSchema = z.object({
    correo: z.email({ message: "Debe ingresar un correo válido" }).max(100),
    contrasena: z.string().min(6).max(255),
    nombre: z.string().trim().min(2, { message: "El nombre es requerido" }),
    apellidos: z.string().trim().min(2, { message: "El apellido es requerido" }),
    telefono: z.string().optional(),
    role: z.enum(Rol).optional(),
});

export const loginUserSchema = z.object({
    correo: z
        .email({ error: "Debe ingresar un correo válido" }),
    contrasena: z
        .string()
        .min(6, { error: "La contraseña debe tener al menos 6 caracteres" }),
});

export type RegisterUserDto = z.infer<typeof registerUserSchema>;
export type LoginUserDto = z.infer<typeof loginUserSchema>;