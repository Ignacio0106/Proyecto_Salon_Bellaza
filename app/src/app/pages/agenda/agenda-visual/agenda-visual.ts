import { CommonModule } from '@angular/common';
import { Component, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { FullCalendarModule, FullCalendarComponent } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventClickArg,
  EventInput,
  EventSourceFuncArg,
} from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';

import { CitaService } from '../../../core/services/cita.service';
import { AuthService } from '../../../core/services/auth.service';
import { CitaListado } from '../../../core/models/cita.model';
import { Role } from '../../../core/models/role.model';
import {
  CitaDetalleDialog,
  CitaDetalleDialogData,
} from '../cita-detalle-dialog/cita-detalle-dialog';

// Colores por estado, coherentes con el resto de la aplicación (badges de citas-list)
const COLORES_ESTADO: Record<string, { bg: string; border: string }> = {
  PENDIENTE: { bg: '#fb8c00', border: '#e65100' },
  ACEPTADA: { bg: '#1e88e5', border: '#1565c0' },
  RECHAZADA: { bg: '#8e24aa', border: '#6a1b9a' },
  COMPLETADA: { bg: '#43a047', border: '#2e7d32' },
  CANCELADA: { bg: '#e53935', border: '#c62828' },
};

@Component({
  selector: 'app-agenda-visual',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    FullCalendarModule,
  ],
  templateUrl: './agenda-visual.html',
  styleUrl: './agenda-visual.css',
})
export class AgendaVisual {
  @ViewChild('calendar') calendarComponent?: FullCalendarComponent;

  private readonly citaService = inject(CitaService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  loading = signal(false);
  error = signal<string | null>(null);

  // Filtros disponibles (usados principalmente por el Administrador)
  estadoFiltro = signal('');
  profesionalFiltro = signal('');

  readonly rol = this.authService.rol;
  readonly esAdmin = computed(() => this.rol() === Role.ADMIN);
  readonly esProfesional = computed(() => this.rol() === Role.PROFESIONAL);

  // Última lista de citas cargada; se usa solo para poblar el filtro de profesionales
  private citasCache = signal<CitaListado[]>([]);

  readonly profesionalesDisponibles = computed<string[]>(() => {
    const set = new Set<string>();
    this.citasCache().forEach((c) => set.add(c.profesional));
    return Array.from(set.values()).sort();
  });

readonly estadosDisponibles: string[] = ['PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'COMPLETADA', 'CANCELADA'];

  readonly leyendaEstados = Object.entries(COLORES_ESTADO).map(([estado, color]) => ({
    estado,
    color: color.bg,
  }));

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: esLocale,
      eventDisplay: 'block', 
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek',
    },
    buttonText: {
      today: 'Hoy',
      month: 'Mes',
      week: 'Semana',
    },
    height: 'auto',
    nowIndicator: true,
    firstDay: 1,
    slotMinTime: '07:00:00',
    slotMaxTime: '21:00:00',
    dayMaxEvents: 3,
    // Carga de eventos desde el API cada vez que cambia el rango visible
    // (mes/semana) o se aplican filtros, garantizando datos siempre actualizados
    events: (info: EventSourceFuncArg, successCallback, failureCallback) => {
      this.cargarEventos(successCallback, failureCallback);
    },
    eventClick: (info: EventClickArg) => this.abrirDetalle(info),
  };

  cargarEventos(
    successCallback: (events: EventInput[]) => void,
    failureCallback: (error: Error) => void
  ): void {
    this.loading.set(true);
    this.error.set(null);

    this.citaService.listar().subscribe({
      next: (res) => {
        const citas = res.data ?? [];
        this.citasCache.set(citas);
        const visibles = this.filtrarPorRolYFiltros(citas);
        successCallback(this.mapearEventos(visibles));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('No se pudieron cargar las citas de la agenda.');
        this.loading.set(false);
        failureCallback(err instanceof Error ? err : new Error('Error al cargar la agenda'));
      },
    });
  }

  private filtrarPorRolYFiltros(citas: CitaListado[]): CitaListado[] {
    const usuario = this.authService.usuario();
    const rol = this.rol();

    let resultado = citas;

    // El Profesional únicamente visualiza las citas asignadas a él mismo
    if (rol === Role.PROFESIONAL && usuario) {
      const nombreCompleto = `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim();
      resultado = resultado.filter((c) => c.profesional === nombreCompleto);
    }

    // Filtros manuales (Administrador: vista general con filtros por estado/profesional)
    const estado = this.estadoFiltro();
    const profesional = this.profesionalFiltro();

    if (estado) {
      resultado = resultado.filter((c) => c.estado === estado);
    }
    if (profesional) {
      resultado = resultado.filter((c) => c.profesional === profesional);
    }

    return resultado;
  }

  private mapearEventos(citas: CitaListado[]): EventInput[] {
    return citas
      .filter((cita) => !!cita.fecha && !!cita.hora)
      .map((cita) => {
        const colores = COLORES_ESTADO[cita.estado as string] ?? {
          bg: '#9e9e9e',
          border: '#616161',
        };
        const inicio = this.combinarFechaHora(cita.fecha, cita.hora);
        const fin = cita.horaFin ? this.combinarFechaHora(cita.fecha, cita.horaFin) : undefined;

        const evento: EventInput = {
          id: String(cita.id),
          title: `${cita.servicio} · ${cita.cliente}`,
          start: inicio,
          end: fin,
          backgroundColor: colores.bg,
          borderColor: colores.border,
          textColor: '#ffffff',
          extendedProps: {
            citaId: cita.id,
            cliente: cita.cliente,
            profesional: cita.profesional,
            servicio: cita.servicio,
            estado: cita.estado,
          },
        };

        return evento;
      });
  }

  // 'fecha' llega como fecha ISO (YYYY-MM-DDTHH:mm:ss.sssZ) y 'hora'/'horaFin'
  // como fecha-hora ISO completas; se combinan para formar el instante del evento
  private combinarFechaHora(fecha: string, hora: string): string {
    const fechaSolo = fecha.substring(0, 10);
    const horaSolo = hora.length >= 19 ? hora.substring(11, 19) : '00:00:00';
    return `${fechaSolo}T${horaSolo}`;
  }

  abrirDetalle(info: EventClickArg): void {
    const citaId = info.event.extendedProps['citaId'] as number;

    const ref = this.dialog.open(CitaDetalleDialog, {
      width: '480px',
      autoFocus: false,
      data: {
        citaId,
        puedeGestionar: this.esAdmin() || this.esProfesional(),
      } as CitaDetalleDialogData,
    });

    ref.afterClosed().subscribe((actualizado: boolean) => {
      // Actualización posterior a cambios de estado: se recarga la agenda
      if (actualizado) {
        this.refrescar();
      }
    });
  }

  aplicarFiltros(): void {
    this.refrescar();
  }

  limpiarFiltros(): void {
    this.estadoFiltro.set('');
    this.profesionalFiltro.set('');
    this.refrescar();
  }

  private refrescar(): void {
    this.calendarComponent?.getApi().refetchEvents();
  }
}