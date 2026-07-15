import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ApiResponse } from '../models/api-response.model';
import { Cita, CitaCreateDto, CitaDetalle, CitaListado, CitaUpdateDto } from '../models/cita.model';

@Injectable({
  providedIn: 'root',
})
export class CitaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/cita`;

  listar() {
    return this.http.get<ApiResponse<CitaListado[]>>(
      this.apiUrl
    );
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<CitaDetalle>>(`${this.apiUrl}/${id}`);
  }

  crear(data: CitaCreateDto) {
    return this.http.post<ApiResponse<CitaDetalle>>(
      this.apiUrl,
      data
    );
  }

  editar(id: number, data: CitaUpdateDto) {
    return this.http.put<ApiResponse<Cita>>(
      `${this.apiUrl}/${id}`,
      data
    );
  }
}
