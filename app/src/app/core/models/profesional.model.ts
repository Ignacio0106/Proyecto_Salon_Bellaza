export interface Profesional {
    id: number;
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    tituloProfesional: string;
    descripcion: string;
    aniosExperiencia: number;
    modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number;
    disponible: boolean;
    imagenPerfil: string;

    especialidades: {
        id: number;
        nombre: string;
        descripcion: string;
    }[];

    // Calificación promedio calculada a partir de reseñas reales
    // (null cuando el profesional aún no tiene reseñas)
    calificacionPromedio?: number | null;
    cantidadResenas?: number;
    resenas?: ProfesionalResena[];
}

// Reseña mostrada en el perfil público del profesional
export interface ProfesionalResena {
    cliente: string;
    puntuacion: number;
    comentario: string;
    fechaResena: string;
}

export interface ProfesionalFormModel {
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    tituloProfesional: string;
    descripcion: string;
    aniosExperiencia: number;
    modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number;
    disponible: boolean;
    imagenPerfil: string;
    especialidadIds: number[];
}

/*export interface ProfesionalDetalle {
    id: number;
    nombreCompleto: string;
    correo: string;
    telefono: string;
    tituloProfesional: string;
    descripcion: string;
    aniosExperiencia: number;
    modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number | string;
    disponible: boolean;
    imagenPerfil: string;

    especialidades: {
        id: number;
        nombre: string;
        descripcion: string;
    }[];
}*/

export interface ProfesionalCreateDto {
    nombre: string;
    apellidos: string;
    correo: string;
    telefono: string;
    tituloProfesional: string;
    descripcion: string;
    aniosExperiencia: number;
    modalidad: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    provincia: string;
    canton: string;
    distrito: string;
    tarifaBase: number;
    disponible: boolean;
    imagenPerfil: string;
    especialidadIds: number[];
}

export interface ProfesionalUpdateDto {
    nombre?: string;
    apellidos?: string;
    correo?: string;
    telefono?: string;
    tituloProfesional?: string;
    descripcion?: string;
    aniosExperiencia?: number;
    modalidad?: 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';
    provincia?: string;
    canton?: string;
    distrito?: string;
    tarifaBase?: number;
    disponible?: boolean;
    imagenPerfil?: string;
    especialidadIds?: number[];
}