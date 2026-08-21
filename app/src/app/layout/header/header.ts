import { Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Notificacion } from '../../core/models/notificacion.model';
import { Role } from '../../core/models/role.model';

export interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private readonly authService = inject(AuthService);
  private readonly notificacionSvc = inject(NotificacionService);
  private readonly router = inject(Router);

  // Menús recibidos desde la aplicación
publicMenu = input<MenuItem[]>([]);
  adminMaintenanceMenu = input<MenuItem[]>([]);
  adminManagementMenu = input<MenuItem[]>([]);
  reportsMenu = input<MenuItem[]>([]); // Input para los reportes
  CitasCount = input(0);

  // Evento opcional si el padre desea hacer alguna acción al salir
  logoutUser = output<void>();

  // Señales obtenidas directamente desde el AuthService
  readonly usuario = this.authService.usuario; // Sinal con los datos del usuario logueado
  readonly autenticado = this.authService.autenticado;
  readonly cargandoSesion = this.authService.cargandoSesion;
  readonly sesionInicializada = this.authService.sesionInicializada;
  readonly rol = this.authService.rol;
  readonly esAdmin = this.authService.esAdmin;

  // Notificaciones (campana del header)
  readonly notificaciones = this.notificacionSvc.notificaciones;
  readonly notificacionesNoLeidas = this.notificacionSvc.noLeidas;

  // Formato estético del rol
  readonly nombreRol = computed(() => {
    const rol = this.rol();
    if (rol === 'ADMINISTRADOR') return 'Administrador';
    if (rol === 'PROFESIONAL') return 'Profesional';
    if (rol === 'CLIENTE') return 'Cliente';
    return 'Usuario';
  });

  // Generación de iniciales para el Avatar (ej. "Carlos Perez" -> "CP")
  readonly iniciales = computed(() => {
    const nombre = this.usuario()?.nombre?.trim();
    if (!nombre) return 'US';
    
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

readonly publicMenuVisible = computed(() =>
    this.publicMenu().filter((item) => this.puedeMostrar(item))
  );

  readonly adminMaintenanceMenuVisible = computed(() =>
    this.adminMaintenanceMenu().filter((item) => this.puedeMostrar(item))
  );

  readonly adminManagementMenuVisible = computed(() =>
    this.adminManagementMenu().filter((item) => this.puedeMostrar(item))
  );

  readonly reportsMenuVisible = computed(() =>
    this.reportsMenu().filter((item) => this.puedeMostrar(item))
  );

  readonly mostrarMenuMantenimientos = computed(
    () => this.adminMaintenanceMenuVisible().length > 0
  );

  // Muestra "Gestión" si hay ítems de gestión O si hay reportes visibles
  readonly mostrarMenuGestion = computed(
    () => this.adminManagementMenuVisible().length > 0 || this.reportsMenuVisible().length > 0
  );

  readonly mostrarMenuReportes = computed(
    () => this.reportsMenuVisible().length > 0
  );

  puedeMostrar(item: MenuItem): boolean {
    if (!item.roles?.length) return true;
    return this.authService.tieneRol(item.roles);
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.logoutUser.emit();
  }

  cargarNotificaciones(): void {
    this.notificacionSvc.cargar();
  }

  // Abre una notificación: la marca como leída y navega al detalle
  // de la cita asociada (si tiene)
  abrirNotificacion(notificacion: Notificacion): void {
    if (!notificacion.leida) {
      this.notificacionSvc.marcarLeida(notificacion.id);
    }

    if (notificacion.citaId) {
      this.router.navigate(['/citas', notificacion.citaId]);
    }
  }

  marcarTodasNotificacionesLeidas(): void {
    this.notificacionSvc.marcarTodasLeidas();
  }
}