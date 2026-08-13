import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional } from '../../../core/models/profesional.model';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card'; // <-- AGREGAR
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-profesionales-list',

  standalone: true,

  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule, // <-- AGREGAR AQUÍ
    MatIconModule,
    MatTooltipModule,
    RouterLink,
],

  templateUrl: './profesionales-list.html',
  styleUrl: './profesionales-list.css'
})


export class ProfesionalesList {
  private readonly profesionalService = inject(ProfesionalService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  profesionales = signal<Profesional[]>([]);
  search = signal('');
  modalidad = signal('');
  disponibilidad = signal('');

  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfesionales();
  }

  loadProfesionales(): void {
    this.loading.set(true);
    this.profesionalService.listar()
    .subscribe({
      next:(response)=>{
        console.log('PROFESIONALES:', response);
        this.profesionales.set(
          response.data ?? []
        );
        this.loading.set(false);
      },

      error:(err)=>{
        console.error(err);
        this.error.set(
          'No se pudieron cargar los profesionales'
        );

        this.loading.set(false);
      }
    });
  }

  modalidades = computed(()=>{

    return [
      ...new Set(
        this.profesionales()
        .map(p=>p.modalidad)
      )
    ];
  });

  profesionalesFiltrados = computed(()=>{

    const texto =
      this.search()
      .toLowerCase()
      .trim();

    const modalidadSeleccionada =
      this.modalidad();

    const disponibilidadSeleccionada =
      this.disponibilidad();

    return this.profesionales()
    .filter(profesional=>{


      const coincideNombre =
        texto === '' ||
        profesional.nombre
        .toLowerCase()
        .includes(texto);

      const coincideModalidad =
        modalidadSeleccionada === '' ||
        profesional.modalidad === modalidadSeleccionada;

      const disponible = profesional.disponible
        ? 'DISPONIBLE'
        : 'NO DISPONIBLE';

      const coincideDisponibilidad =
        disponibilidadSeleccionada === '' ||
        disponible === disponibilidadSeleccionada;

      return (
        coincideNombre &&
        coincideModalidad &&
        coincideDisponibilidad
      );
    });
  });

  totalProfesionales = computed(()=>
    this.profesionalesFiltrados().length
  );

  clearFilters():void{
    this.search.set('');
    this.modalidad.set('');
    this.disponibilidad.set('');
  }

  esAdmin = computed(() => this.authService.esAdmin());

  perfilProfesionalId = computed(
    () => this.authService.usuario()?.perfilProfesionalId ?? null
  );

  puedeCrearProfesional = computed(
    () => this.authService.rol() === Role.ADMIN
  );

  puedeGestionarProfesional(profesional: Profesional): boolean {
    if (this.esAdmin()) {
      return true;
    }
    if (this.authService.rol() !== Role.PROFESIONAL) {
      return false;
    }
    return profesional.id === this.perfilProfesionalId();
  }

  toggleDisponibilidad(profesional: Profesional): void {
    this.profesionalService.cambiarDisponibilidad(profesional.id).subscribe({
      next: (res) => {
        const profesionalActualizado = res.data;

        this.profesionales.update((listaActual) =>
          listaActual.map((e) =>
            e.id === profesional.id ? { ...e, disponible: profesionalActualizado.disponible } : e
          )
        );
        
        const accion = profesionalActualizado.disponible ? 'disponible' : 'no disponible';
        this.notificationService.success(
          `El profesional ${profesional.nombre} ha sido marcado como ${accion}.`,
          'Estado Actualizado'
        );
      },
      error: (err) => {
        console.error('Error al cambiar el estado del profesional', err);
        this.notificationService.error('No se pudo cambiar el estado del profesional.', 'Error');
      }
    });
  }

  
}