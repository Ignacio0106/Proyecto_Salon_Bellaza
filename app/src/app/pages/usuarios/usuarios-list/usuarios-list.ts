import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'; // Para el filtro por rol
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Usuario } from '../../../core/models/usuario.model'; // Asegúrate de tener este modelo
import { UsuariosService } from '../../../core/services/usuarios.service';
import { MatCardContent, MatCard } from "@angular/material/card";
import { MatIcon } from "@angular/material/icon";
import { NotificationService } from '../../../core/services/notification.service';
import { Role } from '../../../core/models/role.model';

@Component({
  selector: 'app-usuarios-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardContent,
    MatCard,
    MatIcon,
  ],
  templateUrl: './usuarios-list.html',
  styleUrl: './usuarios-list.css',
})

export class UsuariosList {
  private readonly usuarioService = inject(UsuariosService);
  private readonly notificationService = inject(NotificationService);

  usuarios = signal<Usuario[]>([]);
  search = signal('');
  rolFiltro = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  displayedColumns = ['nombre', 'correo', 'rol', 'estado', 'acciones'];

  readonly rolesDisponibles: Role[] = [Role.ADMIN, Role.PROFESIONAL, Role.CLIENTE];

  roles = computed<Role[]>(() => {
    const map = new Set<Role>();
    this.usuarios().forEach((usuario) => {
      if (usuario.rol) {
        map.add(usuario.rol);
      }
    });
    return Array.from(map.values());
  });

  usuariosFiltrados = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const rol = this.rolFiltro();
    return this.usuarios().filter((u) => {
      const coincideBusqueda = u.nombre?.toLowerCase().includes(texto) || u.apellidos?.toLowerCase().includes(texto) || u.correo?.toLowerCase().includes(texto);
      const coincideRol = rol === '' || u.rol === rol;
      return coincideBusqueda && coincideRol;
    });
  });

  totalUsuarios = computed(() => this.usuariosFiltrados().length);

  ngOnInit(): void { this.loadUsuarios(); }

  loadUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);
    this.usuarioService.listar().subscribe({
      next: (res) => {
        this.usuarios.set(res.data);
        this.loading.set(false);
      },
      error: () => { this.error.set('Error al cargar usuarios.'); this.loading.set(false); }
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.rolFiltro.set('');
  }

  toggleEstado(usuario: Usuario): void {
    this.usuarioService.cambiarEstado(usuario.id).subscribe({
      next: (res) => {
        const usuarioActualizado = res.data;

        this.usuarios.update((listaActual) =>
          listaActual.map((u) =>
            u.id === usuario.id ? { ...u, estado: usuarioActualizado.estado } : u
          )
        );
        const accion = usuarioActualizado.estado === 'ACTIVO' ? 'activado' : 'desactivado';
        this.notificationService.success(
          `El usuario ${usuario.nombre} ${usuario.apellidos} fue ${accion} con éxito.`,
          'Estado Actualizado'
        );
      },
      error: (err) => {
        console.error('Error al cambiar el estado del usuario', err);
      }
    });
  }

  cambiarRol(usuario: Usuario, nuevoRol: Role): void {
    if (nuevoRol === usuario.rol) return;

    this.usuarioService.cambiarRol(usuario.id, nuevoRol).subscribe({
      next: (res) => {
        this.usuarios.update((listaActual) =>
          listaActual.map((u) =>
            u.id === usuario.id ? { ...u, rol: res.data.rol } : u
          )
        );
        this.notificationService.success(
          `El usuario ${usuario.nombre} ${usuario.apellidos} ahora es ${res.data.rol.toLowerCase()}.`,
          'Rol Actualizado'
        );
      },
      error: () => {
        this.notificationService.error('No se pudo cambiar el rol del usuario.');
        this.usuarios.update((listaActual) => [...listaActual]);
      }
    });
  }
}