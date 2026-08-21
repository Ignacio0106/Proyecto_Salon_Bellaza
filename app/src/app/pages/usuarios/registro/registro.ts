import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioForm } from '../../../shared/components/usuario-form/usuario-form';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, UsuarioCreateDto, UsuarioUpdateDto } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-registro',
  imports: [
    RouterLink,
    MatCardModule,
    MatIconModule,
    UsuarioForm,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly enviando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly exito = signal(false);

  registrar(dto: UsuarioCreateDto | UsuarioUpdateDto): void {
    const datos: RegisterRequest = {
      nombre: dto.nombre ?? '',
      apellidos: dto.apellidos ?? '',
      correo: dto.correo ?? '',
      contrasena: dto.password ?? '',
      telefono: dto.telefono ?? '',
    };

    this.enviando.set(true);
    this.errorServidor.set(null);

    this.authService
      .registrar(datos)
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.exito.set(true);
          setTimeout(() => void this.router.navigate(['/login']), 1500);
        },
        error: (error) => {
          const detalle = error.error?.validationErrors?.[0]?.message;
          this.errorServidor.set(
            detalle ?? error.error?.message ?? 'No fue posible completar el registro.'
          );
        },
      });
  }

  cancelar(): void {
    void this.router.navigate(['/login']);
  }
}