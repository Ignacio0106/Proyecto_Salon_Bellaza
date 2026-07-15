import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Categoria } from '../models/categoria.model';
import { ApiResponse } from '../models/api-response.model';


@Injectable({
  providedIn: 'root'
})
export class CategoriaService {


  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/categoria`;



  listar() {
    return this.http.get<ApiResponse<Categoria[]>>(
      this.apiUrl
    );
  }

  obtenerPorId(id: number) {
    return this.http.get<ApiResponse<Categoria>>(`${this.apiUrl}/${id}`);
  }

cambiarEstado(id: number) {
    return this.http.put<ApiResponse<Categoria>>(`${this.apiUrl}/estado/${id}`, {});
  }

}