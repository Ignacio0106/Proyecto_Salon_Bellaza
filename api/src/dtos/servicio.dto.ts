import { z } from "zod";

export const createServicioSchema = z.object({
    profesionalId: z
        .number({
            message: "El profesional es obligatorio",
        })
        .int()
        .positive("El profesional es obligatorio"),

    categoriaId: z
        .number({
            message: "La categoría es obligatoria",
        })
        .int()
        .positive("La categoría es obligatoria"),

    nombre: z
        .string()
        .trim()
        .min(1, "El nombre es obligatorio")
        .max(150, "El nombre no puede superar 150 caracteres"),

    descripcion: z
        .string()
        .trim()
        .min(10, "La descripción debe tener al menos 10 caracteres")
        .max(1000, "La descripción no puede superar 1000 caracteres"),

    precio: z
        .number({
            message: "El precio debe ser numérico",
        })
        .positive("El precio debe ser mayor que cero"),

    duracionEstimada: z
        .number({
            message: "La duración debe ser numérica",
        })
        .int()
        .positive("La duración debe ser mayor que cero"),

    modalidad: z.enum([
        "VIRTUAL",
        "PRESENCIAL",
        "MIXTA",
    ]),

    estado: z.enum([
        "ACTIVO",
        "INACTIVO",
    ]),

    especialidadIds: z
        .array(
            z.number().int().positive()
        )
        .min(1, "Debe asociar al menos una especialidad"),
});

export const updateServicioSchema =
    createServicioSchema.partial();

export type CreateServicioDto =
    z.infer<typeof createServicioSchema>;

export type UpdateServicioDto =
    z.infer<typeof updateServicioSchema>;