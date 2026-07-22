import { Role } from './role.model';
import { Cita } from './cita.model';
import { Especialidad } from './especialidad.model';

export interface Usuario {
    id: number;
    correo: string;
    nombre?: string | null;
    apellidos?: string | null;
    nombreCompleto?: string;
    telefono?: string | null;
    rol: Role;
    estado: 'ACTIVO' | 'INACTIVO';
    
    // Relaciones según el rol
    citasCliente?: Cita[];
    citasProfesional?: Cita[];
    especialidades?: Especialidad[];
    
    createdAt: string;
    updatedAt: string;
}

export interface UsuarioCreateDto {
    correo: string;
    telefono: string;
    nombre?: string | null;
    apellidos?: string | null;
    password: string;
    rol: Role;
}

export interface UsuarioUpdateDto {
    correo?: string;
    telefono?: string;
    nombre?: string | null;
    apellidos?: string | null;
    password?: string;
    rol?: Role;
}

export interface LoginRequest {
    correo: string;
    contrasena: string;
}

export interface LoginResult {
    token: string;
}

export interface RegisterRequest {
    nombre: string;
    correo: string;
    password: string;
}