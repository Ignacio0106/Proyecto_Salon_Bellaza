import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatDividerModule, MatButtonModule],
  templateUrl: './usuarios-perfil.html',
  styleUrl: './usuarios-perfil.css',
})
export class Perfil {
  private readonly authService = inject(AuthService);

  readonly usuario = this.authService.usuario;
  readonly rol = this.authService.rol;

  readonly nombreCompleto = computed(() => {
    const usuario = this.usuario();
    if (!usuario) return '';
    return usuario.nombreCompleto ?? `${usuario.nombre ?? ''} ${usuario.apellidos ?? ''}`.trim();
  });

  readonly nombreRol = computed(() => {
    switch (this.rol()) {
      case 'ADMINISTRADOR':
        return 'Administrador';
      case 'PROFESIONAL':
        return 'Profesional';
      case 'CLIENTE':
        return 'Cliente';
      default:
        return 'Usuario';
    }
  });

  readonly iniciales = computed(() => {
    const nombre = this.nombreCompleto();
    if (!nombre) return 'US';
    return nombre
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });
}