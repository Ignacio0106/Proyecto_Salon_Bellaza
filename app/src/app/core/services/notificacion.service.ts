import { Injectable, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment.development';
import { ApiResponse } from '../models/api-response.model';
import { Notificacion, NotificacionesRespuesta } from '../models/notificacion.model';
import { AuthService } from './auth.service';

const INTERVALO_ACTUALIZACION_MS = 30000;

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/notificacion`;

  readonly notificaciones = signal<Notificacion[]>([]);
  readonly noLeidas = signal(0);
  readonly cargando = signal(false);

  private temporizador: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Inicia o detiene la consulta automática según la sesión
    effect(() => {
      if (this.authService.autenticado()) {
        this.cargar();
        this.iniciarActualizacionAutomatica();
      } else {
        this.detenerActualizacionAutomatica();
        this.limpiar();
      }
    });
  }

  cargar(): void {
    this.cargando.set(true);
    this.http.get<ApiResponse<NotificacionesRespuesta>>(this.apiUrl).subscribe({
      next: (res) => {
        this.notificaciones.set(res.data?.notificaciones ?? []);
        this.noLeidas.set(res.data?.noLeidas ?? 0);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      },
    });
  }

  marcarLeida(id: number): void {
    this.http.put<ApiResponse<unknown>>(`${this.apiUrl}/${id}/leer`, {}).subscribe({
      next: () => {
        this.notificaciones.update((lista) =>
          lista.map((n) => (n.id === id ? { ...n, leida: true } : n))
        );
        this.recalcularNoLeidas();
      },
    });
  }

  marcarTodasLeidas(): void {
    this.http.put<ApiResponse<unknown>>(`${this.apiUrl}/leer-todas`, {}).subscribe({
      next: () => {
        this.notificaciones.update((lista) =>
          lista.map((n) => ({ ...n, leida: true }))
        );
        this.noLeidas.set(0);
      },
    });
  }

  private recalcularNoLeidas(): void {
    this.noLeidas.set(this.notificaciones().filter((n) => !n.leida).length);
  }

  private iniciarActualizacionAutomatica(): void {
    if (this.temporizador !== null) {
      return;
    }
    this.temporizador = setInterval(() => this.cargar(), INTERVALO_ACTUALIZACION_MS);
  }

  private detenerActualizacionAutomatica(): void {
    if (this.temporizador !== null) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }
  }

  private limpiar(): void {
    this.notificaciones.set([]);
    this.noLeidas.set(0);
  }
}
