import { Servicio } from "./servicio.model";


export interface Categoria {
    id: number;
    nombre: string;
    estado: 'ACTIVO' | 'INACTIVO';
    servicios?: Servicio[];
    createdAt: string;
    updatedAt: string;
}

export interface CategoriaCreateDto {
    nombre: string;
    descripcion?: string | null;
}

export interface CategoriaUpdateDto {
    nombre?: string;
    descripcion?: string | null;
}