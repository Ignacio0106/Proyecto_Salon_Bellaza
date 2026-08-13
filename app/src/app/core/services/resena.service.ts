import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Resena, ResenaCreateDto } from '../models/resena.model';

@Injectable({
  providedIn: 'root',
})
export class ResenaService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}/resena`;

  crear(data: ResenaCreateDto) {
    return this.http.post<ApiResponse<Resena>>(this.apiUrl, data);
  }
}
