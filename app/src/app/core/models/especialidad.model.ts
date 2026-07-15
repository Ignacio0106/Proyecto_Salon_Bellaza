import { Usuario } from './usuario.model';

export interface Especialidad {
    id: number;
    nombre: string;
    estado: 'ACTIVO' | 'INACTIVO';
    profesionales?: Usuario[]; // Relación muchos a muchos
    createdAt: string;
    updatedAt: string;
}

export interface EspecialidadCreateDto {
    id: number;
    nombre: string;
    descripcion?: string | null;
}