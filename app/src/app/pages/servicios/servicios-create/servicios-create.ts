import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ServicioForm } from '../../../shared/components/servicio-form/servicio-form';
import { ServiciosService } from '../../../core/services/servicios.service';
import { ServicioCreateDto, ServicioUpdateDto } from '../../../core/models/servicio.model';

@Component({
  selector: 'app-servicio-create-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ServicioForm],
  templateUrl: './servicios-create.html',
  styleUrl: './servicios-create.css',
})
export class ServicioCreatePage {
  private readonly router = inject(Router);
  private readonly serviciosService = inject(ServiciosService);

  saving = signal(false);
  error = signal<string | null>(null);

  guardar(data: ServicioCreateDto | ServicioUpdateDto): void {
    this.saving.set(true);
    this.error.set(null);

    this.serviciosService.crear(data as ServicioCreateDto).subscribe({
      next: () => {
        this.router.navigate(['/servicios']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo registrar el servicio');
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
