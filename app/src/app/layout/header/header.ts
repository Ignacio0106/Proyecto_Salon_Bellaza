import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDivider } from "@angular/material/divider";
import { AuthService } from '../../core/services/auth.service';
type Role = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';
interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}
interface User {
  nombre: string;
  correo: string;
  role: Role;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDivider
],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  publicMenu = input.required<MenuItem[]>();
  adminMaintenanceMenu = input.required<MenuItem[]>();
  adminManagementMenu = input.required<MenuItem[]>();
  currentUser = input<User | null>(null);
  cartCount = input(0);
  isAdmin = input(false);
  canShowItem = input.required<(item: MenuItem) => boolean>();

  logoutUser = output<void>();
  
  private readonly authService = inject(AuthService);
  readonly usuario = this.authService.usuario

  readonly nombreRol = computed(() => {
    const rol = this.currentUser()?.role;
    if (rol === 'ADMINISTRADOR') return 'Administrador';
    if (rol === 'PROFESIONAL') return 'Profesional';
    if (rol === 'CLIENTE') return 'Cliente';
    return 'Usuario';
  });

  readonly iniciales = computed(() => {
const user = this.currentUser();
    const nombre = (user?.nombre || '').trim();
    if (!nombre) return 'US';
    
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });

  cerrarSesion(): void {
    this.logoutUser.emit();
  }
}
