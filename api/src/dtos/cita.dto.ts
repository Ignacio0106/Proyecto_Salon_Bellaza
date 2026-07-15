import { z } from "zod";

export const createCitaSchema = z.object({
    clienteId: z
        .number()
        .int()
        .positive("El cliente es obligatorio"),

    profesionalId: z
        .number()
        .int()
        .positive("El profesional es obligatorio"),

    servicioId: z
        .number()
        .int()
        .positive("El servicio es obligatorio"),

    fechaCitaSolicitada: z
        .string()
        .min(1, "La fecha es obligatoria"),

    horaInicio: z
        .string()
        .min(1, "La hora es obligatoria"),
horaFinalizacion: z
    .string()
    .min(1, "La hora de finalización es obligatoria"),
    modalidad: z.enum(
        ["VIRTUAL", "PRESENCIAL", "MIXTA"],
        {
            message: "La modalidad es obligatoria",
        }
    ),

    comentarioNecesidad: z
        .string()
        .trim()
        .min(5, "La descripción debe tener al menos 5 caracteres")
        .max(500, "La descripción no puede superar 500 caracteres"),

    montoCalculado: z
        .number({
            message: "El monto debe ser numérico",
        })
        .positive("El monto debe ser mayor a cero"),
});

export const updateCitaSchema = createCitaSchema.partial();

export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;