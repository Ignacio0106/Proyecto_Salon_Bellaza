import { Categoria } from './categoria.model';
import { CitaServicio } from './cita-servicio.model';


export interface Servicio {

    id: number;

    idProfesional?: number;

    nombre: string;

    descripcion: string;

    publicar: boolean;

    precio: number | string;

    duracionEstimada: number;

    imagen: string;


    // Campos que vienen del listado
    profesional?: string;

    modalidad?: string;

    estado?: string;


    categoriaId: number;

    categoria?: Categoria | string;


    citas?: CitaServicio[];

    createdAt: string;

    updatedAt: string;
}


export interface ServicioDetalle {

    id:number;

    nombre:string;

    descripcion:string;

    precio:number | string;

    duracionEstimada:number;

    modalidad:string;

    estado:string;



    categoriaId:number;

    profesionalId:number;



    categoria:{
        id:number;
        nombre:string;
        descripcion:string;
    };



    profesional:{
        id:number;
        nombreCompleto:string;
        correo:string;
        telefono:string;
        tituloProfesional:string;
        aniosExperiencia:number;
        modalidad:string;
        ubicacion:string;
        tarifaBase:number;
    };



    especialidades:{
        id:number;
        nombre:string;
        descripcion:string;
    }[];

}
export interface ServicioFormModel {

    nombre: string;

    descripcion: string;

    publicar: boolean;

    precio: number;

    duracionEstimada: number;

    imagen: string;

    categoriaId: number | null;

}



export interface ServicioCreateDto {

    profesionalId:number;

    categoriaId:number;

    nombre:string;

    descripcion:string;

    precio:number;

    duracionEstimada:number;

    modalidad:string;

    estado:string;

    especialidadIds:number[];

}



export interface ServicioUpdateDto {
 
    profesionalId?: number;
 
    categoriaId?: number;
 
    nombre?: string;
 
    descripcion?: string;
 
    precio?: number;
 
    duracionEstimada?: number;
 
    modalidad?: string;
 
    estado?: string;
 
    especialidadIds?: number[];
 
}
 
 
/**
 * Valor que envía el formulario de edición.
 * A diferencia de ServicioUpdateDto (pensado para updates parciales tipo PATCH),
 * este tipo marca como obligatorios los campos que el formulario valida como requeridos:
 * nombre, precio, duracionEstimada, categoriaId y profesionalId.
 */
export type ServicioEditFormValue = ServicioUpdateDto & {
 
    profesionalId: number;
 
    categoriaId: number;
 
    nombre: string;
 
    precio: number;
 
    duracionEstimada: number;
 
};