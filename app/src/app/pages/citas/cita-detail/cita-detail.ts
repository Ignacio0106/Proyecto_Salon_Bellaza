import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CitaDetalle } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';
import { ESTADO_CITA_LABEL } from '../../../core/models/estado-cita.model';

@Component({
  selector: 'app-cita-detail',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './cita-detail.html',
  styleUrl: './cita-detail.css',
})
export class CitaDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly citaService = inject(CitaService);

  readonly estadoLabel = ESTADO_CITA_LABEL;
  readonly estrellas = [1, 2, 3, 4, 5];

  cita = signal<CitaDetalle | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Devuelve la etiqueta en español de un estado; acepta 'string' con
  // seguridad de tipos porque CitaDetalle.estado es 'EstadoCita | string'.
  estadoTexto(estado: string): string {
    return (this.estadoLabel as Record<string, string>)[estado] ?? estado;
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.error.set('El identificador de la cita no es válido');
      return;
    }

    this.cargar(id);
  }

  cargar(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.obtenerPorId(id).subscribe({
      next: (response) => {
        this.cita.set(response.data ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el detalle de la cita');
        this.loading.set(false);
      },
    });
  }
}