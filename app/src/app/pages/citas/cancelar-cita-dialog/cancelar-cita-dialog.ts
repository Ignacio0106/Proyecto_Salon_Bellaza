import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CitaService } from '../../../core/services/cita.service';
import { NotificationService } from '../../../core/services/notification.service';

// Acción que realiza el diálogo: cancelar la cita o rechazarla
// (ambas exigen un motivo obligatorio)
export type AccionCita = 'CANCELAR' | 'RECHAZAR';

export interface CancelarCitaDialogData {
  citaId: number;
  // Texto informativo que cambia según el estado (Pendiente vs Aceptada)
  descripcionEstado: string;
  // Acción a realizar; por defecto es CANCELAR
  accion?: AccionCita;
}

@Component({
  selector: 'app-cancelar-cita-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './cancelar-cita-dialog.html',
  styleUrl: './cancelar-cita-dialog.css',
})
export class CancelarCitaDialog {
  private readonly citaService = inject(CitaService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<CancelarCitaDialog>);

  guardando = signal(false);

  motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(300)],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: CancelarCitaDialogData) {}

  get esRechazo(): boolean {
    return (this.data.accion ?? 'CANCELAR') === 'RECHAZAR';
  }

  get titulo(): string {
    return this.esRechazo ? 'Rechazar cita' : 'Cancelar cita';
  }

  get etiquetaMotivo(): string {
    return this.esRechazo ? 'Motivo del rechazo' : 'Motivo de la cancelación';
  }

  get textoBoton(): string {
    return this.esRechazo ? 'Confirmar rechazo' : 'Confirmar cancelación';
  }

  confirmar(): void {
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }

    this.guardando.set(true);

    const llamada = this.esRechazo
      ? this.citaService.editar(this.data.citaId, {
          estado: 'RECHAZADA',
          motivo: this.motivo.value.trim(),
        })
      : this.citaService.cancelar(this.data.citaId, this.motivo.value.trim());

    llamada.subscribe({
      next: () => {
        this.guardando.set(false);
        this.notificationService.success(
          this.esRechazo
            ? 'La cita se rechazó correctamente.'
            : 'La cita se canceló correctamente.'
        );
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje =
          err?.error?.message ??
          (this.esRechazo
            ? 'No se pudo rechazar la cita.'
            : 'No se pudo cancelar la cita.');
        this.notificationService.error(mensaje);
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
