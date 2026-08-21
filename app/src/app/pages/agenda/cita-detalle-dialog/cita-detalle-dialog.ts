import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject, computed, inject, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
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

  // Estados que exigen indicar un motivo (igual que hace el cliente
  // al cancelar desde "Mis Citas")
  readonly estadosConMotivo: EstadoCita[] = ['RECHAZADA', 'CANCELADA'];

  // Transiciones válidas según el estado actual de la cita.
  // Ej: una cita PENDIENTE solo puede ser Aceptada, Rechazada o Cancelada.
  readonly transicionesValidas: Record<string, EstadoCita[]> = {
    PENDIENTE: ['ACEPTADA', 'RECHAZADA', 'CANCELADA'],
    ACEPTADA: ['COMPLETADA', 'CANCELADA'],
    RECHAZADA: [],
    CANCELADA: [],
    COMPLETADA: [],
  };

  // Estados disponibles para cambiar, según el estado actual de la cita
  estadosDisponibles = computed<EstadoCita[]>(() => {
    const c = this.cita();
    if (!c) {
      return [];
    }
    return this.transicionesValidas[c.estado as string] ?? [];
  });

  motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)],
  });

  // Comentario opcional que el profesional puede agregar al aceptar
  comentario = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(300)],
  });

  requiereMotivo(estado: EstadoCita | ''): boolean {
    return this.estadosConMotivo.includes(estado as EstadoCita);
  }

  constructor(@Inject(MAT_DIALOG_DATA) public data: CitaDetalleDialogData) {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.obtenerPorId(this.data.citaId).subscribe({
      next: (res) => {
        this.cita.set(res.data ?? null);
        // No se pre-selecciona el estado actual: el usuario debe elegir
        // explícitamente una transición válida
        this.estadoSeleccionado.set('');
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

    // Validación previa: no se puede completar antes de la fecha y hora
    // programadas de la cita
    const cita = this.cita();
    if (nuevoEstado === 'COMPLETADA' && cita?.horaFinalizacion) {
      const finProgramado = new Date(cita.horaFinalizacion);
      if (finProgramado > new Date()) {
        this.notificationService.warning(
          'No se puede completar la cita porque su fecha y hora programadas aún no han llegado'
        );
        this.estadoSeleccionado.set('');
        return;
      }
    }

    // Rechazar o cancelar exige un motivo, igual que el cliente
    const conMotivo = this.requiereMotivo(nuevoEstado);
    if (conMotivo) {
      this.motivo.markAsTouched();
      if (this.motivo.invalid) {
        return;
      }
    }

    const comentarioLimpio = this.comentario.value.trim();

    this.guardando.set(true);
    this.citaService
      .editar(this.data.citaId, {
        estado: nuevoEstado,
        ...(conMotivo ? { motivo: this.motivo.value.trim() } : {}),
        ...(nuevoEstado === 'ACEPTADA' && comentarioLimpio
          ? { comentario: comentarioLimpio }
          : {}),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.notificationService.success('El estado de la cita se actualizó correctamente.');
          // Se cierra devolviendo "true" para que la Agenda Visual recargue los eventos
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.guardando.set(false);
          const mensaje = err?.error?.message ?? 'No se pudo actualizar el estado de la cita.';
          this.notificationService.error(mensaje);
        },
      });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}