import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CitaDetalle } from '../../../core/models/cita.model';
import { EstadoCita } from '../../../core/models/estado-cita.model';

export interface CitaDetalleDialogData {
  citaId: number;
  // Indica si el usuario logueado puede cambiar el estado de la cita
  // (Administrador y Profesional sí pueden; Cliente solo consulta)
  puedeGestionar: boolean;
}

@Component({
  selector: 'app-cita-detalle-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cita-detalle-dialog.html',
  styleUrl: './cita-detalle-dialog.css',
})
export class CitaDetalleDialog {
  private readonly citaService = inject(CitaService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<CitaDetalleDialog>);

  loading = signal(false);
  guardando = signal(false);
  error = signal<string | null>(null);
  cita = signal<CitaDetalle | null>(null);

  estadoSeleccionado = signal<EstadoCita | ''>('');

  readonly estados: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: CitaDetalleDialogData) {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.obtenerPorId(this.data.citaId).subscribe({
      next: (res) => {
        this.cita.set(res.data ?? null);
        this.estadoSeleccionado.set((res.data?.estado as EstadoCita) ?? '');
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la cita.');
        this.loading.set(false);
      },
    });
  }

  guardarEstado(): void {
    const nuevoEstado = this.estadoSeleccionado();
    if (!nuevoEstado) {
      return;
    }

    this.guardando.set(true);
    this.citaService.editar(this.data.citaId, { estado: nuevoEstado }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notificationService.success('El estado de la cita se actualizó correctamente.');
        // Se cierra devolviendo "true" para que la Agenda Visual recargue los eventos
        this.dialogRef.close(true);
      },
      error: () => {
        this.guardando.set(false);
        this.notificationService.error('No se pudo actualizar el estado de la cita.');
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}