import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/api-response.model';

import { Profesional, ProfesionalCreateDto, ProfesionalUpdateDto } from '../models/profesional.model';


@Injectable({
    providedIn: 'root'
})
export class ProfesionalService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/perfilProfesional`;

    listar() {
        return this.http.get<ApiResponse<Profesional[]>>(
            this.apiUrl
        );
    }

    obtenerPorId(id: number) {
        return this.http.get<ApiResponse<Profesional>>(
            `${this.apiUrl}/${id}`
        );
    }

    validarCorreo(correo: string) {
        return this.http.get<ApiResponse<{ existe: boolean }>>(
            `${this.apiUrl}/validar-correo`,
            { params: { correo } }
        );
    }
  getImageUrl(imageName: string): string {
    return `${environment.imageUrl}/${imageName}`;
  }
    cambiarDisponibilidad(id: number) {
        return this.http.put<ApiResponse<Profesional>>(`${this.apiUrl}/estado/${id}`, {});
    }

    crear(data: ProfesionalCreateDto) {
        return this.http.post<ApiResponse<Profesional>>(
            this.apiUrl,
            data
        );
    }

    editar(id: number, data: ProfesionalUpdateDto) {
        return this.http.put<ApiResponse<Profesional>>(
            `${this.apiUrl}/${id}`,
            data
        );
    }
}