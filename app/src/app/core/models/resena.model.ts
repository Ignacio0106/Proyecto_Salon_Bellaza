export interface Resena {
    id: number;
    citaId: number;
    clienteId: number;
    profesionalId: number;
    puntuacion: number;
    comentario: string;
    fechaResena: string;
}

export interface ResenaCreateDto {
    citaId: number;
    puntuacion: number;
    comentario: string;
}
