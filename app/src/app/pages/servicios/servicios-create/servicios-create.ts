import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';


import { Categoria } from '../../../core/models/categoria.model';
import { Profesional } from '../../../core/models/profesional.model';
import { Especialidad } from '../../../core/models/especialidad.model';

import { 
    ServicioCreateDto 
} from '../../../core/models/servicio.model';


import { ServiciosService } from '../../../core/services/servicios.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { EspecialidadService } from '../../../core/services/especialidad.service';



@Component({
    selector: 'app-servicio-create-page',

    standalone: true,

    imports: [

        CommonModule,
        FormsModule,

        MatButtonModule,
        MatCardModule,
        MatChipsModule,
        MatIconModule,
        MatProgressSpinnerModule,

        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,


    ],

    templateUrl: './servicios-create.html',

    styleUrl: './servicios-create.css'
})


export class ServicioCreatePage {



    private readonly router = inject(Router);

    private readonly serviciosService = inject(ServiciosService);

    private readonly categoriaService = inject(CategoriaService);

    private readonly profesionalService = inject(ProfesionalService);

    private readonly especialidadService = inject(EspecialidadService);



    categorias = signal<Categoria[]>([]);

    profesionales = signal<Profesional[]>([]);

    especialidades = signal<Especialidad[]>([]);



    loading = signal(false);

    saving = signal(false);

    error = signal<string | null>(null);



    constructor(){

        this.cargarDatosFormulario();

    }




    cargarDatosFormulario(): void {

  this.loading.set(true);

  forkJoin({

    categorias: this.categoriaService.listar(),

    profesionales: this.profesionalService.listar(),

    especialidades: this.especialidadService.listar()

  }).subscribe({

    next: (response) => {

      console.log('CATEGORIAS:', response.categorias);
      console.log('PROFESIONALES:', response.profesionales);
      console.log('ESPECIALIDADES:', response.especialidades);


      this.categorias.set(
        response.categorias.data ?? []
      );


      this.profesionales.set(
        response.profesionales.data ?? []
      );


      this.especialidades.set(
        response.especialidades.data ?? []
      );


      this.loading.set(false);

    },


    error:(err)=>{

      console.error('ERROR:', err);

      this.error.set(
        'No se pudieron cargar los datos del formulario'
      );

      this.loading.set(false);

    }

  });




    }







    guardar(data: ServicioCreateDto): void {


        this.saving.set(true);

        this.error.set(null);



        console.log(
            'Servicio enviado:',
            data
        );



        this.serviciosService.crear(data)

        .subscribe({



            next:()=>{


                this.router.navigate([
                    '/servicios'
                ]);


            },



            error:(err)=>{


                console.error(err);


                this.error.set(
                    'No se pudo registrar el servicio'
                );


                this.saving.set(false);


            },



            complete:()=>{


                this.saving.set(false);


            }


        });



    }







    cancelar():void{


        this.router.navigate([
            '/servicios'
        ]);


    }



}