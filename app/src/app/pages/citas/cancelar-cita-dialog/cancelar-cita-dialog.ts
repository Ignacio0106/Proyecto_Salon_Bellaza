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

export interface CancelarCitaDialogData {
  citaId: number;
  // Texto informativo que cambia según el estado (Pendiente vs Aceptada)
  descripcionEstado: string;
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

  confirmar(): void {
    if (this.motivo.invalid) {
      this.motivo.markAsTouched();
      return;
    }

    this.guardando.set(true);

    this.citaService.cancelar(this.data.citaId, this.motivo.value.trim()).subscribe({
      next: () => {
        this.guardando.set(false);
        this.notificationService.success('La cita se canceló correctamente.');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        const mensaje = err?.error?.message ?? 'No se pudo cancelar la cita.';
        this.notificationService.error(mensaje);
      },
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
