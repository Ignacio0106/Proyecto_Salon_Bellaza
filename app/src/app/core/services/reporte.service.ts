import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { ReporteCitasPorEstado, ReporteCitasPorProfesional, ReporteDeCalificaciones } from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/reporte`;

  /**
   * Reporte de citas completadas por profesional.
   */
  citasPorProfesional() {
    return this.http.get<ApiResponse<ReporteCitasPorProfesional[]>>(
      `${this.apiUrl}/citas-por-profesional`
    );
  }

  /**
 * Reporte resumido y detallado de citas por estado.
 */
  citasPorEstado() {
    return this.http.get<ApiResponse<ReporteCitasPorEstado>>(`${this.apiUrl}/citas-por-estado`);
  }

  /**
   * Reporte de calificaciones por profesional.
   */
  calificaciones() {
    return this.http.get<ApiResponse<ReporteDeCalificaciones[]>>(`${this.apiUrl}/calificaciones`);
  }
}