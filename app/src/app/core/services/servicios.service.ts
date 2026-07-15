import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment.development';

import { 
    ApiPaginatedResponse, 
    ApiResponse 
} from '../models/api-response.model';

import { 
    Servicio,
    ServicioDetalle,
    ServicioCreateDto,
    ServicioUpdateDto
} from '../models/servicio.model';



@Injectable({
  providedIn: 'root',
})


export class ServiciosService {


    private readonly http = inject(HttpClient);


    private readonly apiUrl =
        `${environment.apiUrl}/Servicio`;



    listar(){

        return this.http.get<ApiPaginatedResponse<Servicio>>(
            this.apiUrl
        );

    }



    obtenerPorId(id:number){

        return this.http.get<ApiResponse<ServicioDetalle>>(
            `${this.apiUrl}/${id}`
        );

    }

cambiarEstado(id: number) {
    return this.http.put<ApiResponse<Servicio>>(`${this.apiUrl}/estado/${id}`, {});
  }

    crear(data: ServicioCreateDto) {

    return this.http.post<ApiResponse<Servicio>>(
      this.apiUrl,
      data
    );

  }






  editar(id:number, data: ServicioUpdateDto) {

    return this.http.put<ApiResponse<Servicio>>(
      `${this.apiUrl}/${id}`,
      data
    );

  }



    getImageUrl(imageName:string){

        return `${environment.imageUrl}/${imageName}`;

    }



}