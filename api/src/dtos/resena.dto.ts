import { z } from "zod";

export const crearResenaSchema = z.object({
    citaId: z
        .number()
        .int()
        .positive("La cita es obligatoria"),

    puntuacion: z
        .number()
        .int()
        .min(1, "La puntuación mínima es 1")
        .max(5, "La puntuación máxima es 5"),

    comentario: z
        .string()
        .trim()
        .min(5, "El comentario debe tener al menos 5 caracteres")
        .max(500, "El comentario no puede superar 500 caracteres"),
});

export type CrearResenaDto = z.infer<typeof crearResenaSchema>;
