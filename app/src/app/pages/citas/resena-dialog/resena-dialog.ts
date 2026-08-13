import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ResenaService } from '../../../core/services/resena.service';
import { NotificationService } from '../../../core/services/notification.service';

export interface ResenaDialogData {
  citaId: number;
  profesional: string;
  servicio: string;
}

@Component({
  selector: 'app-resena-dialog',
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
  templateUrl: './resena-dialog.html',
  styleUrl: './resena-dialog.css',
})
export class ResenaDialog {
  private readonly resenaService = inject(ResenaService);
  private readonly notificationService = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ResenaDialog>);

  guardando = signal(false);
  puntuacion = signal(0);

  readonly estrellas = [1, 2, 3, 4, 5];

  comentario = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500)],
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: ResenaDialogData) {}

  seleccionarPuntuacion(valor: number): void {
    this.puntuacion.set(valor);
  }

  confirmar(): void {
    this.comentario.markAsTouched();

    if (this.puntuacion() === 0 || this.comentario.invalid) {
      return;
    }

    this.guardando.set(true);

    this.resenaService
      .crear({
        citaId: this.data.citaId,
        puntuacion: this.puntuacion(),
        comentario: this.comentario.value.trim(),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.notificationService.success('¡Gracias por tu reseña!');
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.guardando.set(false);
          const mensaje = err?.error?.message ?? 'No se pudo registrar la reseña.';
          this.notificationService.error(mensaje);
        },
      });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
