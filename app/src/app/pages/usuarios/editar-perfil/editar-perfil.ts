import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { UsuarioForm } from '../../../shared/components/usuario-form/usuario-form';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, UsuarioCreateDto, UsuarioUpdateDto } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-editar-perfil',
  imports: [
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    UsuarioForm,
  ],
  templateUrl: './editar-perfil.html',
  styleUrl: './editar-perfil.css',
})
export class EditarPerfil {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal(false);

  readonly usuarioParaFormulario = computed<RegisterRequest | null>(() => {
    const user = this.authService.usuario();
    if (!user) return null;
    return {
      nombre: user.nombre ?? '',
      apellidos: user.apellidos ?? '',
      correo: user.correo,
      contrasena: '',
      telefono: user.telefono ?? '',
    };
  });

  guardar(dto: UsuarioCreateDto | UsuarioUpdateDto): void {
    this.saving.set(true);
    this.error.set(null);

    this.authService
      .actualizarPerfil(dto as UsuarioUpdateDto)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.exito.set(true);
          setTimeout(() => void this.router.navigate(['/perfil']), 1200);
        },
        error: (err) => {
          const detalle = err.error?.validationErrors?.[0]?.message;
          this.error.set(
            detalle ?? err.error?.message ?? 'No se pudo actualizar el perfil.'
          );
        },
      });
  }

  cancelar(): void {
    void this.router.navigate(['/perfil']);
  }
}