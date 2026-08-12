import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Role } from '../../core/models/role.model';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  roles?: Role[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  CitasCount = signal(2);

  publicMenu = signal<MenuItem[]>([
    { label: 'Inicio', path: '/', icon: 'home' },
    { label: 'Servicios', path: '/servicios', icon: 'spa' },
    { label: 'Profesionales', path: '/profesionales', icon: 'content_cut' },
    {
      label: 'Mis Citas',
      path: '/citas',
      icon: 'event_available',
      roles: [Role.CLIENTE, Role.PROFESIONAL],
    },
  ]);

  adminMaintenanceMenu = signal<MenuItem[]>([
    { label: 'Categorías', path: '/categorias', icon: 'category', roles: [Role.ADMIN] },
    { label: 'Especialidades', path: '/especialidades', icon: 'auto_awesome', roles: [Role.ADMIN] },
    { label: 'Usuarios', path: '/usuarios', icon: 'group', roles: [Role.ADMIN] },
  ]);

  adminManagementMenu = signal<MenuItem[]>([
    {
      label: 'Control de Citas',
      path: '/gestion-citas',
      icon: 'calendar_month',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
    {
      label: 'Agenda Visual',
      path: '/agenda-visual',
      icon: 'event_available',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
    {
      label: 'Reseñas',
      path: '/resenas',
      icon: 'rate_review',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
  ]);

  reportsMenu = signal<MenuItem[]>([
    {
      label: 'Reportes de Citas por Estado',
      path: '/reportes/citas',
      icon: 'event',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
    {
      label: 'Reportes Citas por Profesional',
      path: '/reportes/citasProfesional',
      icon: 'person_search',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
    {
      label: 'Reportes de Calificaciones',
      path: '/reportes/calificaciones',
      icon: 'star',
      roles: [Role.ADMIN, Role.PROFESIONAL],
    },
  ]);
}