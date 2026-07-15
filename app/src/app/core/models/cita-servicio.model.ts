import { Cita } from './cita.model';
import { Servicio } from './servicio.model';

export interface CitaServicio {
    citaId: number;
    servicioId: number;
    precioFixed: number | string; // Precio congelado al momento de reservar
    
    cita?: Cita;
    servicio?: Servicio;
    createdAt: string;
    updatedAt: string;
}

export interface CitaServicioCreateDto {
    servicioId: number;
}