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
import { NotificationService } from '../../../core/services/notification.service';
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
  private readonly notificationService = inject(NotificationService);

  readonly estadoLabel = ESTADO_CITA_LABEL;

  citas = signal<CitaListado[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  readonly usuario = this.authService.usuario;
  readonly rol = this.authService.rol;
  readonly esCliente = computed(() => this.rol() === Role.CLIENTE);
  readonly esProfesional = computed(() => this.rol() === Role.PROFESIONAL);

  // Ordena de la más reciente a la más antigua. La hora de inicio viene
  // como ISO completo (incluye la fecha), por lo que sirve como llave
  // exacta de ordenamiento; se usa la fecha como respaldo.
  private ordenarRecientesPrimero(
    citas: CitaListado[]
  ): CitaListado[] {
    return [...citas].sort((a, b) => {
      const tiempoA = new Date(a.hora || a.fecha).getTime();
      const tiempoB = new Date(b.hora || b.fecha).getTime();
      return tiempoB - tiempoA;
    });
  }

  // Filtra según el usuario autenticado (login real, no simulado)
  // y ordena el resultado de la cita más nueva a la más vieja.
  citasVisibles = computed(() => {
    const usuario = this.usuario();
    if (!usuario) {
      return [];
    }

    if (this.esCliente()) {
      return this.ordenarRecientesPrimero(
        this.citas().filter((cita) => cita.clienteId === usuario.id)
      );
    }

    if (this.esProfesional()) {
      const nombreCompleto = `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim();
      return this.ordenarRecientesPrimero(
        this.citas().filter((cita) => cita.profesional === nombreCompleto)
      );
    }

    return [];
  });

  // Historial cronológico agrupado por fecha. citasVisibles ya viene
  // ordenada de más nueva a más vieja, así que los grupos heredan ese orden
  // y las citas de cada día también quedan de la última a la primera.
  historialAgrupado = computed<GrupoHistorial[]>(() => {
    const grupos = new Map<string, CitaListado[]>();
    for (const cita of this.citasVisibles()) {
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
    // Cliente y Profesional pueden cancelar sus propias citas
    // (en ambos casos se exige un motivo)
    const esParte = this.esCliente() || this.esProfesional();
    return esParte && ESTADOS_CANCELABLES.includes(cita.estado as EstadoCita);
  }

  // Acciones del Profesional sobre una cita PENDIENTE
  puedeAceptar(cita: CitaListado): boolean {
    return this.esProfesional() && cita.estado === 'PENDIENTE';
  }

  puedeRechazar(cita: CitaListado): boolean {
    return this.esProfesional() && cita.estado === 'PENDIENTE';
  }

  // Una cita ACEPTADA puede marcarse como COMPLETADA por el Profesional
  puedeCompletar(cita: CitaListado): boolean {
    return this.esProfesional() && cita.estado === 'ACEPTADA';
  }

  // Id de la cita que se está procesando (para deshabilitar botones)
  procesandoId = signal<number | null>(null);

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

  // Rechaza una cita PENDIENTE (el Profesional debe indicar el motivo)
  abrirRechazar(cita: CitaListado): void {
    const ref = this.dialog.open(CancelarCitaDialog, {
      width: '460px',
      autoFocus: false,
      data: {
        citaId: cita.id,
        accion: 'RECHAZAR',
        descripcionEstado:
          'Al rechazar la cita, el cliente será notificado con el motivo.',
      } as CancelarCitaDialogData,
    });

    ref.afterClosed().subscribe((rechazada: boolean) => {
      if (rechazada) {
        this.cargarCitas();
      }
    });
  }

  // Acepta una cita PENDIENTE (se notifica al cliente)
  aceptar(cita: CitaListado): void {
    this.cambiarEstado(cita, 'ACEPTADA', 'La cita fue aceptada correctamente');
  }

  // Marca una cita ACEPTADA como COMPLETADA
  completar(cita: CitaListado): void {
    // Validación previa: no se puede completar antes de la fecha y hora
    // programadas de la cita
    if (cita.horaFin && new Date(cita.horaFin) > new Date()) {
      this.notificationService.warning(
        'No se puede completar la cita porque su fecha y hora programadas aún no han llegado'
      );
      return;
    }

    this.cambiarEstado(cita, 'COMPLETADA', 'La cita fue marcada como completada');
  }

  private cambiarEstado(
    cita: CitaListado,
    estado: EstadoCita,
    mensajeExito: string
  ): void {
    if (this.procesandoId() !== null) {
      return;
    }

    this.procesandoId.set(cita.id);

    this.citaService.editar(cita.id, { estado }).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.notificationService.success(mensajeExito);
        this.cargarCitas();
      },
      error: (err) => {
        this.procesandoId.set(null);
        const mensaje = err?.error?.message ?? 'No se pudo actualizar el estado de la cita';
        this.notificationService.error(mensaje);
      },
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
