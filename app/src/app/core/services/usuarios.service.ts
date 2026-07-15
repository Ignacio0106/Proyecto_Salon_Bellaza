import { inject, Injectable } from '@angular/core';
import { Usuario } from '../models/usuario.model';
import { ApiPaginatedResponse, ApiResponse } from '../models/api-response.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
    private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuario`;

  listar() {
    return this.http.get<ApiPaginatedResponse<Usuario>>(this.apiUrl);
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/${id}`);
  }

cambiarEstado(id: number) {
    return this.http.put<ApiResponse<Usuario>>(`${this.apiUrl}/estado/${id}`, {});
  }
}
