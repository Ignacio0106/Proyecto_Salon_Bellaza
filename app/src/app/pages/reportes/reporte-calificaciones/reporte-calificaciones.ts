import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { NotificationService } from '../../../core/services/notification.service';
import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteDeCalificaciones } from '../../../core/models/reporte.model';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { PdfCalificacionesService } from '../../../core/services/pdf-calificaciones.service';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from '@angular/material/input';

type EstadoFiltro = '' | 'mejor' | 'normal' | 'bajo' | 'sinResenas';

@Component({
  selector: 'app-reporte-calificaciones',
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
  ],
  templateUrl: './reporte-calificaciones.html',
  styleUrl: './reporte-calificaciones.css',
})
export class ReporteCalificaciones {
  private readonly reporteService      = inject(ReporteService);
  private readonly pdfService          = inject(PdfCalificacionesService);
  private readonly authService         = inject(AuthService);
  private readonly notificationService = inject(NotificationService);

  readonly UMBRAL_BAJO = 3.0;

  datos   = signal<ReporteDeCalificaciones[]>([]);
  loading = signal(false);
  error   = signal<string | null>(null);

  // ── Filtros ───────────────────────────────────────────────────────────────
  filtroBusqueda = signal('');
  filtroEstado   = signal<EstadoFiltro>('');

  displayedColumns = ['profesional', 'promedioCalificacion', 'cantidadResenas', 'mejorServicio', 'destacado'];

  // ── Computed ──────────────────────────────────────────────────────────────

  private maxPromedio = computed(() => {
    const conResenas = this.datos().filter(f => f.cantidadResenas > 0);
    return conResenas.length
      ? Math.max(...conResenas.map(f => f.promedioCalificacion))
      : -1;
  });

  totalResenas = computed(() =>
    this.datos().reduce((acc, f) => acc + f.cantidadResenas, 0)
  );

  datosFiltrados = computed(() => {
    const busqueda = this.filtroBusqueda().toLowerCase().trim();
    const estado   = this.filtroEstado();

    return this.datos().filter(fila => {
      // ── Filtro de texto ──────────────────────────────────────────────
      if (busqueda) {
        const enNombre = fila.profesional.toLowerCase().includes(busqueda);
        const enTitulo = (fila.tituloProfesional ?? '').toLowerCase().includes(busqueda);
        if (!enNombre && !enTitulo) return false;
      }

      // ── Filtro de estado ─────────────────────────────────────────────
      if (estado === 'sinResenas') return fila.cantidadResenas === 0;
      if (estado === 'mejor')      return this.esMejorCalificado(fila);
      if (estado === 'bajo')       return this.esBajaCalificacion(fila);
      if (estado === 'normal') {
        return fila.cantidadResenas > 0
          && !this.esMejorCalificado(fila)
          && !this.esBajaCalificacion(fila);
      }

      return true;
    });
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.cargarReporte();
  }

  // ── Métodos públicos ──────────────────────────────────────────────────────

  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reporteService.calificaciones().subscribe({
      next: (response) => {
        this.datos.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte de calificaciones.');
        this.loading.set(false);
      },
    });
  }

  onBusqueda(event: Event): void {
    this.filtroBusqueda.set((event.target as HTMLInputElement).value);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda.set('');
    this.filtroEstado.set('');
  }

  esMejorCalificado(fila: ReporteDeCalificaciones): boolean {
    return fila.cantidadResenas > 0 &&
           fila.promedioCalificacion === this.maxPromedio();
  }

  esBajaCalificacion(fila: ReporteDeCalificaciones): boolean {
    return fila.cantidadResenas > 0 &&
           fila.promedioCalificacion < this.UMBRAL_BAJO;
  }

  getClaseBadge(fila: ReporteDeCalificaciones): string {
    if (this.esMejorCalificado(fila))  return 'badge-estrella--mejor';
    if (this.esBajaCalificacion(fila)) return 'badge-estrella--bajo';
    return 'badge-estrella--normal';
  }

  exportarPdf(): void {
    if (!this.datos().length) {
      this.notificationService.error('No hay datos disponibles para exportar.', 'Reporte vacío');
      return;
    }
    const usuario     = this.authService.usuario();
    const generadoPor = usuario
      ? `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim()
      : 'Usuario del sistema';

    // El PDF siempre exporta el conjunto completo, no solo los filtrados
    this.pdfService.exportarCalificaciones(
      this.datosFiltrados(), generadoPor, this.UMBRAL_BAJO, this.maxPromedio()
    );

    this.notificationService.success('El PDF del reporte se generó correctamente.', 'Exportación exitosa');
  }
}