import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

type Role = 'ADMINISTRADOR' | 'PROFESIONAL' | 'CLIENTE';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

interface User {
  nombre: string;
  role: Role;
}

const CURRENT_USER_KEY = 'currentUser';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  cartCount = signal(2);
  currentUser = signal<User | null>(this.readCurrentUser());
  publicMenu = signal<MenuItem[]>([
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Servicios', path: '/servicios', icon: 'spa' },
    { 
      label: 'Profesionales', 
      path: '/profesionales', 
      icon: 'content_cut' 
    },
    { 
      label: 'Mis Citas', 
      path: '/citas', 
      icon: 'event_available', 
      roles: ['CLIENTE', 'PROFESIONAL'] 
    },
    ]);

    adminMaintenanceMenu = signal<MenuItem[]>([
    { 
      label: 'Categorías', 
      path: '/categorias', 
      icon: 'category' 
    },
    { 
      label: 'Especialidades', 
      path: '/especialidades', 
      icon: 'auto_awesome' 
    },
    { 
      label: 'Usuarios', 
      path: '/usuarios', 
      icon: 'group' 
    },
  ]);

  adminManagementMenu = signal<MenuItem[]>([
    { 
      label: 'Control de Citas', 
      path: '/gestion-citas', 
      icon: 'calendar_month' 
    },
    { 
      label: 'Reseñas', 
      path: '/resenas', 
      icon: 'rate_review' // Cambiado por un icono estándar válido de Material
    },
    { 
      label: 'Reportes Globales', 
      path: '/reportes', 
      icon: 'bar_chart', 
      roles: ['ADMINISTRADOR'] 
    },
  ]);

  isAdmin = computed(() => this.currentUser()?.role === 'ADMINISTRADOR');

  isProfesional = computed(() => this.currentUser()?.role === 'PROFESIONAL');

  private readCurrentUser(): User | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) {
      return null;
    }

    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  private saveCurrentUser(user: User | null): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(CURRENT_USER_KEY);
  }

  canShowItem(item: MenuItem): boolean {
    if (!item.roles) return true;
    const user = this.currentUser();
    return !!user && item.roles.includes(user.role);
  }
  loginAsClient(): void {
    const user: User = { nombre: 'Cliente Demo', role: 'CLIENTE' };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }
  loginAsAdmin(): void {
    const user: User = { nombre: 'Admin Demo', role: 'ADMINISTRADOR' };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }
  loginAsProfesional(): void {
    const user: User = { nombre: 'Profesional Demo', role: 'PROFESIONAL' };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }
  logout(): void {
    this.currentUser.set(null);
    this.saveCurrentUser(null);
  }
}
