export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA';

export interface EstadoCitaOption {
    value: EstadoCita;
    label: string;
}