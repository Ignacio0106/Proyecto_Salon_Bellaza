import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { CitasPorProfesional } from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class ReporteService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/reporte`;

  /**
   * Reporte de citas completadas por profesional.
   * El backend filtra automáticamente según el rol del usuario autenticado:
   * - ADMINISTRADOR: recibe el reporte de todos los profesionales.
   * - PROFESIONAL: recibe únicamente su propia fila.
   */
  citasPorProfesional() {
    return this.http.get<ApiResponse<CitasPorProfesional[]>>(
      `${this.apiUrl}/citas-por-profesional`
    );
  }
}