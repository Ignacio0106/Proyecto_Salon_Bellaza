import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { CitaListado } from '../../../core/models/cita.model';
import { CitaService } from '../../../core/services/cita.service';

type Role = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';

interface CurrentUser {
  nombre: string;
  role: Role;
}

const CURRENT_USER_KEY = 'currentUser';

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
    RouterLink,
  ],
  templateUrl: './citas.html',
  styleUrl: './citas.css',
})
export class Citas {
  private readonly citaService = inject(CitaService);

  citas = signal<CitaListado[]>([]);
  currentUser = signal<CurrentUser | null>(this.readCurrentUser());
  loading = signal(false);
  error = signal<string | null>(null);

  citasVisibles = computed(() => {
    const user = this.currentUser();

    if (!user) {
      return [];
    }

    return this.citas().filter((cita) => {
      if (user.role === 'CLIENTE') {
        return cita.cliente === user.nombre;
      }

      if (user.role === 'PROFESIONAL') {
        return cita.profesional === user.nombre;
      }

      return false;
    });
  });

  ngOnInit(): void {
    this.cargarCitas();
  }

  private readCurrentUser(): CurrentUser | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as CurrentUser;
    } catch {
      return null;
    }
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
}
