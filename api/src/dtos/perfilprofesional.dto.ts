import { z } from "zod";

export const createProfesionalSchema = z.object({
    nombre: z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio")
        .max(100, "El nombre no puede superar 100 caracteres"),

    apellidos: z
        .string()
        .trim()
        .min(1, "Los apellidos son obligatorios")
        .max(100, "Los apellidos no pueden superar 100 caracteres"),

    correo: z
        .email("Debe ingresar un correo válido"),

    telefono: z
        .string()
        .trim()
        .min(8, "El teléfono debe tener al menos 8 caracteres")
        .max(20, "El teléfono no puede superar 20 caracteres"),

    tituloProfesional: z
        .string()
        .trim()
        .min(1, "El título profesional es obligatorio")
        .max(150, "El título no puede superar 150 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(1000, "La descripción no puede superar 1000 caracteres"),

    aniosExperiencia: z
        .number({
            message: "Los años de experiencia deben ser numéricos",
        })
        .int("Debe ser un número entero")
        .min(0, "La experiencia no puede ser negativa"),

    modalidad: z.enum([
        "VIRTUAL",
        "PRESENCIAL",
        "MIXTA",
    ]),

    provincia: z
        .string()
        .trim()
        .min(1, "La provincia es obligatoria"),

    canton: z
        .string()
        .trim()
        .min(1, "El cantón es obligatorio"),

    distrito: z
        .string()
        .trim()
        .min(1, "El distrito es obligatorio"),

    tarifaBase: z
        .number({
            message: "La tarifa debe ser numérica",
        })
        .positive("La tarifa debe ser mayor que cero"),

    disponible: z.boolean(),

    imagenPerfil: z
        .string()
        .trim()
        .max(255, "La imagen no puede superar 255 caracteres")
        .optional(),

    especialidadIds: z
        .array(
            z.number().int().positive()
        )
        .min(1, "Debe asociar al menos una especialidad"),
});

export const updateProfesionalSchema =
    createProfesionalSchema.partial();

export type CreateProfesionalDto =
    z.infer<typeof createProfesionalSchema>;

export type UpdateProfesionalDto =
    z.infer<typeof updateProfesionalSchema>;

