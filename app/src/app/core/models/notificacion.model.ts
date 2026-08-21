export interface Notificacion {
    id: number;
    citaId: number | null;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fechaCreacion: string;
}

export interface NotificacionesRespuesta {
    notificaciones: Notificacion[];
    noLeidas: number;
}
