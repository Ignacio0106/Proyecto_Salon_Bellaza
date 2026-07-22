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
  correo: string;
  rol: Role; // Mantenemos la convención en español para coincidir con tu backend
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
      icon: 'rate_review' 
    },
    { 
      label: 'Reportes Globales', 
      path: '/reportes', 
      icon: 'bar_chart', 
      roles: ['ADMINISTRADOR'] 
    },
  ]);

  // Corregido: Usar .rol
  isAdmin = computed(() => this.currentUser()?.rol === 'ADMINISTRADOR');
  isProfesional = computed(() => this.currentUser()?.rol === 'PROFESIONAL');

  // Función flecha para pasar el contexto correcto al hijo sin usar .bind(this)
  canShowItem = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    const user = this.currentUser();
    return !!user && item.roles.includes(user.rol);
  };

  private readCurrentUser(): User | null {
    if (typeof localStorage === 'undefined') return null;

    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (!stored) return null;

    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  }

  private saveCurrentUser(user: User | null): void {
    if (typeof localStorage === 'undefined') return;

    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return;
    }

    localStorage.removeItem(CURRENT_USER_KEY);
  }

  // Corregido: Objetos con correo y rol requeridos por la interfaz
  loginAsClient(): void {
    const user: User = { 
      nombre: 'Cliente Demo', 
      correo: 'cliente@demo.com', 
      rol: 'CLIENTE' 
    };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }

  loginAsAdmin(): void {
    const user: User = { 
      nombre: 'Admin Demo', 
      correo: 'admin@demo.com', 
      rol: 'ADMINISTRADOR' 
    };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }

  loginAsProfesional(): void {
    const user: User = { 
      nombre: 'Profesional Demo', 
      correo: 'pro@demo.com', 
      rol: 'PROFESIONAL' 
    };
    this.currentUser.set(user);
    this.saveCurrentUser(user);
  }

  logout(): void {
    this.currentUser.set(null);
    this.saveCurrentUser(null);
  }
}