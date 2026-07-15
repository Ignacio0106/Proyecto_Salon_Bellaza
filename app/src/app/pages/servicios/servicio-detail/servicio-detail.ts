import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServicioDetalle } from '../../../core/models/servicio.model';
import { ServiciosService } from '../../../core/services/servicios.service';


@Component({
  selector: 'app-servicio-detail',

  standalone: true,

  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],

  templateUrl: './servicio-detail.html',
  styleUrl: './servicio-detail.css',
})


export class ServicioDetail {


  private readonly route = inject(ActivatedRoute);

  private readonly servicioService = inject(ServiciosService);



  servicio = signal<ServicioDetalle | null>(null);

  loading = signal(false);

  error = signal<string | null>(null);




  ngOnInit(): void {


    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );



    if (!id) {

      this.error.set(
        'El identificador del servicio no es válido.'
      );

      return;

    }


    this.loadServicio(id);

  }





  loadServicio(id:number):void {


    this.loading.set(true);

    this.error.set(null);



    this.servicioService.obtenerPorId(id)
      .subscribe({


        next:(response)=>{


          console.log(response.data);


          this.servicio.set(response.data);


          this.loading.set(false);


        },



        error:()=>{


          this.error.set(
            'No se pudo cargar el detalle del servicio.'
          );


          this.loading.set(false);


        }


      });


  }



}