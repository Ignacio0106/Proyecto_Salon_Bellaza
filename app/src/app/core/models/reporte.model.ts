export interface ReporteCitasPorProfesional {
    profesionalId: number;
    profesional: string;
    tituloProfesional: string;
    totalCitas: number;
    citasCompletadas: number;
    porcentajeFinalizacion: number;
}

export interface ReporteDeCalificaciones {
  profesionalId: number;
  profesional: string;
  tituloProfesional: string;
  promedioCalificacion: number;
  cantidadResenas: number;
  // Mejor servicio calificado del profesional (null si no tiene reseñas)
  mejorServicio?: string | null;
  mejorServicioPromedio?: number | null;
  // Servicios con promedio menor al umbral de baja calificación
  serviciosBajaCalificacion?: string[];
}

//Reportes de citas por estado
export interface ReporteCitasPorEstado {
  id: number | string;
  fechaCitaSolicitada: string | Date;
  estado: 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA' | 'COMPLETADA';
  montoCalculado: number;
  cliente: {
    nombre: string;
    apellidos: string;
  };
  profesional: {
    usuario: {
      nombre: string;
      apellidos: string;
    };
  };
  servicio: {
    nombre: string;
    categoria: {
      nombre: string;
    };
  }
}