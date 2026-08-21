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
import { EstadoCita, ESTADO_CITA_LABEL } from '../../../core/models/estado-cita.model';

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

  // Catálogo fijo de estados con etiqueta legible para el filtro
  readonly estadosCatalogo = (
    Object.entries(ESTADO_CITA_LABEL) as Array<[EstadoCita, string]>
  ).map(([valor, etiqueta]) => ({ valor, etiqueta }));

  // Etiqueta en español de un estado cualquiera
  estadoTexto(estado: string): string {
    return (ESTADO_CITA_LABEL as Record<string, string>)[estado] ?? estado;
  }

  // Iniciales de un nombre completo para los avatares del listado
  iniciales(nombreCompleto: string): string {
    return nombreCompleto
      .split(' ')
      .filter((parte) => parte.length > 0)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  }

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

  // Cantidad de resultados luego de aplicar los filtros
  totalFiltradas = computed(() => this.citasFiltradas().length);

  // Indica si hay al menos un filtro aplicado
  hayFiltrosActivos = computed(
    () =>
      this.estadoFiltro() !== '' ||
      this.profesionalFiltro() !== '' ||
      this.fechaInicio() !== null ||
      this.fechaFin() !== null
  );

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
      },
      error: () => {
        this.error.set('No se pudo cargar el listado de citas. Verifique su conexión e intente nuevamente.');
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
