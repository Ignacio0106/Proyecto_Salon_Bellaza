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

// Schema específico para actualizar el estado de una cita
// (usado por la Agenda Visual al cambiar el estado desde el detalle de la cita)
// NOTA: se corrige para que coincida con el enum real de Prisma (schema.prisma).
// Antes decía "CONFIRMADA", valor que no existe en la base de datos y provocaba
// que Prisma rechazara la actualización de estado.
export const updateEstadoCitaSchema = z.object({
    estado: z.enum(
        ["PENDIENTE", "ACEPTADA", "RECHAZADA", "COMPLETADA", "CANCELADA"],
        { message: "El estado indicado no es válido" }
    ),
});

// Schema para la cancelación de una cita desde "Mis Citas" del Cliente.
// El motivo es obligatorio tanto para Pendiente como para Aceptada.
export const cancelarCitaSchema = z.object({
    motivo: z
        .string()
        .trim()
        .min(5, "El motivo debe tener al menos 5 caracteres")
        .max(300, "El motivo no puede superar 300 caracteres"),
});

export type CreateCitaDto = z.infer<typeof createCitaSchema>;
export type UpdateCitaDto = z.infer<typeof updateCitaSchema>;
export type UpdateEstadoCitaDto = z.infer<typeof updateEstadoCitaSchema>;
export type CancelarCitaDto = z.infer<typeof cancelarCitaSchema>;