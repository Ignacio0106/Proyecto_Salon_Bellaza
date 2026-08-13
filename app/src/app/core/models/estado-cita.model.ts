// NOTA: se corrige para que coincida con el enum real de Prisma
// (api/prisma/schema.prisma -> enum EstadoCita). Antes este archivo
// incluia "CONFIRMADA", un valor que no existe en la base de datos.
export type EstadoCita = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'COMPLETADA' | 'CANCELADA';

export interface EstadoCitaOption {
    value: EstadoCita;
    label: string;
}

export const ESTADO_CITA_LABEL: Record<EstadoCita, string> = {
    PENDIENTE: 'Pendiente',
    ACEPTADA: 'Aceptada',
    RECHAZADA: 'Rechazada',
    COMPLETADA: 'Completada',
    CANCELADA: 'Cancelada',
};

// Estados desde los que el Cliente puede cancelar una cita.
export const ESTADOS_CANCELABLES: EstadoCita[] = ['PENDIENTE', 'ACEPTADA'];
