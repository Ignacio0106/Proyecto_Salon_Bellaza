import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { ReporteService } from '../../../core/services/reporte.service';
import { PdfReporteService } from '../../../core/services/pdf-reporte.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CitasPorProfesional } from '../../../core/models/reporte.model';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-reporte-citas-by-profesional',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
  ],
  templateUrl: './reporte-citas-by-profesional.html',
  styleUrl: './reporte-citas-by-profesional.css',
})
export class ReporteCitasByProfesional {
  private readonly reporteService = inject(ReporteService);
  private readonly pdfReporteService = inject(PdfReporteService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  datos = signal<CitasPorProfesional[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  displayedColumns = ['profesional', 'tituloProfesional', 'citasCompletadas'];
  esAdmin = computed(() => this.authService.rol() === Role.ADMIN);
  totalCitasCompletadas = computed(() =>
    this.datos().reduce((acumulado, fila) => acumulado + fila.citasCompletadas, 0)
  );
  ngOnInit(): void {
    this.cargarReporte();
  }
  cargarReporte(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reporteService.citasPorProfesional().subscribe({
      next: (response) => {
        this.datos.set(response.data ?? []);
        this.loading.set(false);
        console.log('Reporte de citas por profesional cargado:', response.data);
      },
      error: () => {
        this.error.set('No se pudo cargar el reporte de citas por profesional.');
        this.loading.set(false);
      },
    });
  }
  exportarPdf(): void {
    if (!this.datos().length) {
      this.notificationService.error(
        'No hay datos disponibles para exportar.',
        'Reporte vacío'
      );
      return;
    }

    const usuario = this.authService.usuario();
    const generadoPor = usuario
      ? `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim()
      : 'Usuario del sistema';

    this.pdfReporteService.exportarCitasPorProfesional(this.datos(), generadoPor);

    this.notificationService.success(
      'El PDF del reporte se generó correctamente.',
      'Exportación exitosa'
    );
  }
} 