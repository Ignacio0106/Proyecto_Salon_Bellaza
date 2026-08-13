import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form';
import { ServiciosService } from '../../../core/services/servicios.service';
import {
  ServicioCreateDto,
  ServicioDetalle,
  ServicioUpdateDto,
} from '../../../core/models/servicio.model';

@Component({
  selector: 'app-servicio-edit-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, ServicioForm],
  templateUrl: './servicios-edit.html',
  styleUrl: './servicios-edit.css',
})
export class ServicioEditPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serviciosService = inject(ServiciosService);

  private readonly servicioId = Number(this.route.snapshot.paramMap.get('id'));

  servicio = signal<ServicioDetalle | null>(null);

  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.cargarServicio();
  }

  cargarServicio(): void {
    if (!this.servicioId) {
      this.error.set('El identificador del servicio no es válido');
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.serviciosService.obtenerPorId(this.servicioId).subscribe({
      next: (response) => {
        this.servicio.set(response.data ?? null);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del servicio');
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }

  guardar(data: ServicioCreateDto | ServicioUpdateDto): void {
    if (!this.servicioId) return;

    this.saving.set(true);
    this.error.set(null);

    this.serviciosService.editar(this.servicioId, data as ServicioUpdateDto).subscribe({
      next: () => {
        this.router.navigate(['/servicios']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo actualizar el servicio');
        this.saving.set(false);
      },
      complete: () => {
        this.saving.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/servicios']);
  }
}
