import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { MatButtonModule } from '@angular/material/button'; // Para mat-icon-button y mat-stroked-button

import { EspecialidadService } from '../../../core/services/especialidad.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Especialidad } from '../../../core/models/especialidad.model';

@Component({
  selector: 'app-especialidades-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardContent,
    MatCard,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './especialidades-list.html',
  styleUrl: './especialidades-list.css',
})
export class EspecialidadesList implements OnInit {
  private readonly especialidadService = inject(EspecialidadService);
  private readonly notificationService = inject(NotificationService);

  especialidades = signal<Especialidad[]>([]);
  search = signal('');
  estadoFiltro = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  displayedColumns = ['nombre', 'estado', 'acciones'];

  estadosDisponibles = computed<string[]>(() => {
    const map = new Set<string>();
    this.especialidades().forEach((especialidad) => {
      if (especialidad.estado) {
        map.add(especialidad.estado);
      }
    });
    return Array.from(map.values());
  });

  especialidadesFiltradas = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const estado = this.estadoFiltro();
    return this.especialidades().filter((e) => {
      const coincideBusqueda = e.nombre?.toLowerCase().includes(texto);
      const coincideEstado = estado === '' || e.estado === estado;

      return coincideBusqueda && coincideEstado;
    });
  });

  totalEspecialidades = computed(() => this.especialidadesFiltradas().length);

  ngOnInit(): void { 
    this.loadEspecialidades(); 
  }

  loadEspecialidades(): void {
    this.loading.set(true);
    this.error.set(null);
    this.especialidadService.listar().subscribe({
      next: (res) => {
        this.especialidades.set(res.data);
        this.loading.set(false);
        console.log('Especialidades cargadas:', res.data);
      },
      error: () => { 
        this.error.set('Error al cargar especialidades.'); 
        this.loading.set(false); 
      }
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.estadoFiltro.set('');
  }

  toggleEstado(especialidad: Especialidad): void {
    this.especialidadService.cambiarEstado(especialidad.id).subscribe({
      next: (res) => {
        const especialidadActualizada = res.data;

        this.especialidades.update((listaActual) =>
          listaActual.map((e) =>
            e.id === especialidad.id ? { ...e, estado: especialidadActualizada.estado } : e
          )
        );
        
        const accion = especialidadActualizada.estado === 'ACTIVO' ? 'activada' : 'desactivada';
        this.notificationService.success(
          `La especialidad "${especialidad.nombre}" fue ${accion} con éxito.`,
          'Estado Actualizado'
        );
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la especialidad', err);
        this.notificationService.error('No se pudo cambiar el estado de la especialidad.', 'Error');
      }
    });
  }
}