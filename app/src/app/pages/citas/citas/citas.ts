import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { CitaListado } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/role.model';
import {
  ESTADO_CITA_LABEL,
  ESTADOS_CANCELABLES,
  EstadoCita,
} from '../../../core/models/estado-cita.model';
import {
  CancelarCitaDialog,
  CancelarCitaDialogData,
} from '../cancelar-cita-dialog/cancelar-cita-dialog';
import { ResenaDialog, ResenaDialogData } from '../resena-dialog/resena-dialog';

// Un grupo del historial cronológico: todas las citas de una misma fecha
export interface GrupoHistorial {
  fecha: string;
  citas: CitaListado[];
}

@Component({
  selector: 'app-citas',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterLink,
  ],
  templateUrl: './citas.html',
  styleUrl: './citas.css',
})
export class Citas {
  private readonly citaService = inject(CitaService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly estadoLabel = ESTADO_CITA_LABEL;

  citas = signal<CitaListado[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly usuario = this.authService.usuario;
  readonly rol = this.authService.rol;
  readonly esCliente = computed(() => this.rol() === Role.CLIENTE);
  readonly esProfesional = computed(() => this.rol() === Role.PROFESIONAL);

  // Filtra según el usuario autenticado (login real, no simulado).
  citasVisibles = computed(() => {
    const usuario = this.usuario();
    if (!usuario) {
      return [];
    }

    if (this.esCliente()) {
      return this.citas().filter((cita) => cita.clienteId === usuario.id);
    }

    if (this.esProfesional()) {
      const nombreCompleto = `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim();
      return this.citas().filter((cita) => cita.profesional === nombreCompleto);
    }

    return [];
  });

  // Historial cronológico: agrupado por fecha, orden descendente
  // (la cita más reciente primero) para que el Cliente vea su historial
  // de forma clara y pueda dar seguimiento a cada cita.
  historialAgrupado = computed<GrupoHistorial[]>(() => {
    const citas = [...this.citasVisibles()].sort((a, b) => {
      const fechaA = `${a.fecha}T${a.hora ?? '00:00'}`;
      const fechaB = `${b.fecha}T${b.hora ?? '00:00'}`;
      return fechaB.localeCompare(fechaA);
    });

    const grupos = new Map<string, CitaListado[]>();
    for (const cita of citas) {
      const clave = cita.fecha;
      const grupo = grupos.get(clave) ?? [];
      grupo.push(cita);
      grupos.set(clave, grupo);
    }

    return Array.from(grupos.entries()).map(([fecha, citasDelDia]) => ({
      fecha,
      citas: citasDelDia,
    }));
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.listar().subscribe({
      next: (response) => {
        this.citas.set(response.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las citas');
        this.loading.set(false);
      },
    });
  }

  puedeCancelar(cita: CitaListado): boolean {
    return this.esCliente() && ESTADOS_CANCELABLES.includes(cita.estado as EstadoCita);
  }

  puedeResenar(cita: CitaListado): boolean {
    return this.esCliente() && cita.estado === 'COMPLETADA' && !cita.tieneResena;
  }

  yaResenada(cita: CitaListado): boolean {
    return this.esCliente() && cita.estado === 'COMPLETADA' && !!cita.tieneResena;
  }

  // Devuelve la etiqueta en español de un estado; acepta 'string' con
  // seguridad de tipos porque CitaListado.estado es 'EstadoCita | string'.
  estadoTexto(estado: string): string {
    return (this.estadoLabel as Record<string, string>)[estado] ?? estado;
  }

  abrirCancelar(cita: CitaListado): void {
    const descripcionEstado =
      cita.estado === 'PENDIENTE'
        ? 'Esta cita todavía no ha sido aceptada por el profesional.'
        : 'Esta cita ya fue aceptada por el profesional. Al cancelarla, se notificará el motivo.';

    const ref = this.dialog.open(CancelarCitaDialog, {
      width: '460px',
      autoFocus: false,
      data: { citaId: cita.id, descripcionEstado } as CancelarCitaDialogData,
    });

    ref.afterClosed().subscribe((cancelada: boolean) => {
      // Actualización posterior a cambios de estado
      if (cancelada) {
        this.cargarCitas();
      }
    });
  }

  abrirResena(cita: CitaListado): void {
    const ref = this.dialog.open(ResenaDialog, {
      width: '460px',
      autoFocus: false,
      data: {
        citaId: cita.id,
        profesional: cita.profesional,
        servicio: cita.servicio,
      } as ResenaDialogData,
    });

    ref.afterClosed().subscribe((enviada: boolean) => {
      if (enviada) {
        this.cargarCitas();
      }
    });
  }
}
