import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { CitaCreateDto } from '../../../core/models/cita.model';
import { Profesional } from '../../../core/models/profesional.model';
import { Servicio, ServicioDetalle } from '../../../core/models/servicio.model';
import { CitaService } from '../../../core/services/cita.service';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { ServiciosService } from '../../../core/services/servicios.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

type Modalidad = 'VIRTUAL' | 'PRESENCIAL' | 'MIXTA';

interface CitaFormValue {
  clienteId: number | null;
  profesionalId: number | null;
  servicioId: number | null;
  fechaCitaSolicitada: string;
  horaInicio: string;
  modalidad: Modalidad | '';
  comentarioNecesidad: string;
}

@Component({
  selector: 'app-cita-reserva',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
],
  templateUrl: './cita-reserva.html',
  styleUrl: './cita-reserva.css',
})
export class CitaReserva {
  private readonly citaService = inject(CitaService);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly serviciosService = inject(ServiciosService);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  profesionales = signal<Profesional[]>([]);
  servicios = signal<Servicio[]>([]);

  loading = signal(false);
  submitting = signal(false);
  error = signal<string | null>(null);

  servicioDetalle = signal<ServicioDetalle | null>(null);

  clienteActual = computed(() => {
    const usuario = this.authService.usuario();
    if (!usuario) {
      return '';
    }
    return (
      usuario.nombreCompleto ??
      `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim()
    );
  });

  form: CitaFormValue = {
    clienteId: this.authService.usuario()?.id ?? null,
    profesionalId: null,
    servicioId: null,
    fechaCitaSolicitada: '',
    horaInicio: '',
    modalidad: '',
    comentarioNecesidad: '',
  };

  serviciosFiltrados(): Servicio[] {
    const profesionalId = this.form.profesionalId;

    if (!profesionalId) {
      return [];
    }
    return this.servicios().filter((servicio) => servicio.idProfesional === profesionalId);
  }

  horaFinalizacion(): string {
    const horaInicio = this.form.horaInicio;
    const duracion = Number(this.servicioDetalle()?.duracionEstimada ?? 0);

    if (!horaInicio || !duracion) {
      return '';
    }

    return this.calcularHoraFinalizacion(horaInicio, duracion);
  }

  montoCalculado(): number {
    return Number(this.servicioDetalle()?.precio ?? 0);
  }

  constructor() {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      profesionales: this.profesionalService.listar(),
      servicios: this.serviciosService.listar(),
    }).subscribe({
      next: (response) => {
        this.profesionales.set(response.profesionales.data ?? []);
        this.servicios.set(response.servicios.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del formulario');
        this.loading.set(false);
      },
    });
  }

  onProfesionalChange(profesionalId: number | null): void {
    this.form.profesionalId = profesionalId;
    this.form.servicioId = null;
    this.servicioDetalle.set(null);
  }

  onServicioChange(servicioId: number | null): void {
    this.form.servicioId = servicioId;

  if (!servicioId) {
    this.servicioDetalle.set(null);
    this.form.modalidad = '';
    return;
  }
    this.serviciosService.obtenerPorId(servicioId).subscribe({
      next: (response) => {

        const detalle = response.data ?? null;

        this.servicioDetalle.set(detalle);

      this.form.modalidad = (detalle?.modalidad as Modalidad) ?? '';
      },
      error: () => {
        this.notificationService.error('No se pudo cargar el servicio seleccionado', 'Error');
        this.servicioDetalle.set(null);
      },
    });
  }

  guardar(formValid: boolean): void {
    if (!formValid || this.submitting()) {
      return;
    }

    const value = this.form;
    if (!value.clienteId || !value.profesionalId || !value.servicioId || !value.fechaCitaSolicitada || !value.horaInicio || !value.modalidad || !value.comentarioNecesidad.trim()) {
      this.error.set('Completa todos los campos obligatorios');
      return;
    }

    const duracion = Number(this.servicioDetalle()?.duracionEstimada ?? 0);
    if (!duracion) {
      this.error.set('Selecciona un servicio válido');
      return;
    }

    const payload: CitaCreateDto = {
      clienteId: value.clienteId,
      profesionalId: value.profesionalId,
      servicioId: value.servicioId,
      fechaCitaSolicitada: value.fechaCitaSolicitada,
      horaInicio: value.horaInicio,
      horaFinalizacion: this.calcularHoraFinalizacion(value.horaInicio, duracion),
      modalidad: value.modalidad as Modalidad,
      comentarioNecesidad: value.comentarioNecesidad.trim(),
      montoCalculado: Number(this.servicioDetalle()?.precio ?? 0),
    };

    this.submitting.set(true);
    this.error.set(null);

    this.citaService.crear(payload).subscribe({
      next: () => {
        this.notificationService.success('La cita fue registrada correctamente', 'Cita creada');
        this.router.navigate(['/citas']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo registrar la cita');
        this.submitting.set(false);
      },
      complete: () => {
        this.submitting.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/citas']);
  }

  private calcularHoraFinalizacion(horaInicio: string, duracionMinutos: number): string {
    const [horas, minutos] = horaInicio.split(':').map(Number);
    const fecha = new Date();
    fecha.setHours(horas, minutos, 0, 0);
    fecha.setMinutes(fecha.getMinutes() + duracionMinutos);
    return fecha.toTimeString().slice(0, 5);
  }
}
