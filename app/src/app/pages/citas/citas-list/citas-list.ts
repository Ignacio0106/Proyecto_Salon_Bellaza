import { Component, computed, inject, signal } from '@angular/core';
import { CitaListado } from '../../../core/models/cita.model';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatHeaderRowDef, MatRowDef, MatCellDef, MatHeaderCellDef, MatTableModule } from "@angular/material/table";
import { MatChipSet, MatChip, MatChipsModule } from "@angular/material/chips";
import { MatCard, MatCardContent, MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelect, MatOption, MatSelectModule } from "@angular/material/select";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-citas-list',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinner,
    RouterLink,
],
  templateUrl: './citas-list.html',
  styleUrl: './citas-list.css',
})
export class CitasList {
  private readonly citasService = inject(CitaService);
  private readonly notificationService = inject(NotificationService);

  citas = signal<CitaListado[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  // Signals para los Filtros requeridos
  estadoFiltro = signal('');
  profesionalFiltro = signal('');
  fechaInicio = signal<Date | null>(null);
  fechaFin = signal<Date | null>(null);

  displayedColumns = ['cliente', 'profesional', 'servicio', 'fechaHora', 'estado', 'acciones'];

  // Extrae la lista de profesionales únicos que tienen citas asignadas
  profesionalesDisponibles = computed<string[]>(() => {
    const map = new Set<string>();
    this.citas().forEach((cita) => {
      if (cita.profesional) {
        map.add(cita.profesional);
      }
    });
    return Array.from(map.values());
  });

  // Extrae de forma dinámica los estados de las citas existentes (ej: PENDIENTE, COMPLETADA, CANCELADA)
  estadosDisponibles = computed<string[]>(() => {
    const map = new Set<string>();
    this.citas().forEach((cita) => {
      if (cita.estado) {
        map.add(cita.estado);
      }
    });
    return Array.from(map.values());
  });

  // Lógica funcional que combina TODOS los filtros de manera simultánea
  citasFiltradas = computed(() => {
    const estado = this.estadoFiltro();
    const profesional = this.profesionalFiltro();
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();

    return this.citas().filter((cita) => {
      // 1. Filtro por Estado
      const coincideEstado = estado === '' || cita.estado === estado;

      // 2. Filtro por Profesional
      const coincideProfesional = profesional === '' || cita.profesional === profesional;

      // 3. Filtro por Rango de Fechas
      let coincideFecha = true;
      if (cita.fecha) {
        const fechaCita = new Date(cita.fecha);
        // Reseteamos horas para comparar solo el día completo
        fechaCita.setHours(0,0,0,0);

        if (inicio) {
          const fInicio = new Date(inicio);
          fInicio.setHours(0,0,0,0);
          if (fechaCita < fInicio) coincideFecha = false;
        }
        if (fin) {
          const fFin = new Date(fin);
          fFin.setHours(0,0,0,0);
          if (fechaCita > fFin) coincideFecha = false;
        }
      }

      return coincideEstado && coincideProfesional && coincideFecha;
    });
  });

  ngOnInit(): void {
    this.loadCitas();
  }

  loadCitas(): void {
    this.loading.set(true);
    this.error.set(null);
    this.citasService.listar().subscribe({
      next: (res) => {
        this.citas.set(res.data ?? []);
        this.loading.set(false);
        console.log('Citas cargadas:', res.data);
      },
      error: () => {
        this.error.set('Error al cargar el listado de citas.');
        this.loading.set(false);
      }
    });
  }

  clearFilters(): void {
    this.estadoFiltro.set('');
    this.profesionalFiltro.set('');
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
  }
}
