import { CitaServicio } from './cita-servicio.model';
import { EstadoCita } from './estado-cita.model';

import { Usuario } from './usuario.model';


export interface Cita {
    id: number;
    fecha: string;
    estado: EstadoCita;
    total: number | string;
    
    clienteId: number;
    cliente?: Usuario;
    
    profesionalId: number;
    profesional?: Usuario;
    
    servicios?: CitaServicio[];
    createdAt: string;
    updatedAt: string;
}

export interface CitaListado {
    id: number;
    clienteId?: number;
    profesionalId?: number;
    cliente: string;
    profesional: string;
    servicio: string;
    fecha: string;
    hora: string;
    horaFin?: string;
    estado: EstadoCita | string;
    // Indica si el Cliente ya registró una reseña para esta cita
    tieneResena?: boolean;
}

export interface CitaDetalle {
    id: number;
    cliente: {
        nombreCompleto: string;
        correo: string;
        telefono: string;
    };
    profesional: {
        nombreCompleto: string;
        correo: string;
        telefono: string;
        tituloProfesional: string;
    };
    servicio: {
        nombre: string;
        descripcion: string;
        precio: number | string;
    };
    fecha: string;
    horaInicio: string;
    horaFinalizacion: string;
    modalidad: string;
    descripcion: string;
    comentarioProfesional?: string | null;
    estado: EstadoCita | string;
    montoCalculado: number | string;
    // Reseña registrada por el Cliente para esta cita (si existe)
    resena?: {
        puntuacion: number;
        comentario: string;
        fechaResena: string;
    } | null;
    // Motivo con el que se canceló la cita (si fue cancelada)
    motivoCancelacion?: string | null;
}

export interface CitaCreateDto {
    clienteId: number;
    profesionalId: number;
    servicioId: number;
    fechaCitaSolicitada: string;
    horaInicio: string;
    horaFinalizacion: string;
    modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    comentarioNecesidad: string;
    montoCalculado: number;
}

export interface CitaUpdateDto {
    estado?: EstadoCita;
}