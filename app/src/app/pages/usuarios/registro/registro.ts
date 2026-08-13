import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-registro',
  imports: [
    RouterLink,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly ocultarPassword = signal(true);
  readonly enviando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly exito = signal(false);

  // Confirmación de contraseña (no se envía al API: solo valida la coincidencia)
  readonly confirmacion = signal('');
  readonly confirmacionTocada = signal(false);

  readonly coincidenPasswords = computed(
    () => this.model().contrasena === this.confirmacion()
  );

  readonly confirmacionInvalida = computed(
    () => this.confirmacionTocada() && this.model().contrasena !== this.confirmacion()
  );

  // Fuerza de la contraseña: 0 a 5 puntos según largo y variedad
  readonly fuerzaPassword = computed(() => {
    const valor = this.model().contrasena;
    if (!valor) return 0;

    let puntos = 0;
    if (valor.length >= 6) puntos += 1;
    if (valor.length >= 8) puntos += 1;
    if (/[A-Z]/.test(valor)) puntos += 1;
    if (/[0-9]/.test(valor)) puntos += 1;
    if (/[^A-Za-z0-9]/.test(valor)) puntos += 1;
    return puntos;
  });

  readonly fuerzaLabel = computed<{ clase: string; texto: string }>(() => {
    const puntos = this.fuerzaPassword();
    if (puntos <= 2) return { clase: 'weak', texto: 'Débil' };
    if (puntos <= 4) return { clase: 'medium', texto: 'Media' };
    return { clase: 'strong', texto: 'Fuerte' };
  });

  readonly model = signal<RegisterRequest>({
    nombre: '',
    apellidos: '',
    correo: '',
    contrasena: '',
    telefono: '',
  });

  // NOTA: no existe ningún campo para elegir "rol" — el registro público
  // siempre crea usuarios CLIENTE, tal como lo exige el enunciado.
  readonly registroForm = form(this.model, (path) => {
    required(path.nombre, { message: 'El nombre es obligatorio.' });
    required(path.apellidos, { message: 'Los apellidos son obligatorios.' });
    required(path.correo, { message: 'El correo es obligatorio.' });
    email(path.correo, { message: 'Ingrese un correo válido.' });
    required(path.contrasena, { message: 'La contraseña es obligatoria.' });
    minLength(path.contrasena, 6, { message: 'La contraseña debe tener al menos 6 caracteres.' });
    required(path.telefono, { message: 'El teléfono es obligatorio.' });
    minLength(path.telefono, 8, { message: 'El teléfono debe tener al menos 8 dígitos.' });
  });

  submit(): void {
    this.submitted.set(true);
    if (this.registroForm().invalid()) return;

    this.confirmacionTocada.set(true);
    if (this.model().contrasena !== this.confirmacion()) return;

    this.enviando.set(true);
    this.errorServidor.set(null);

    this.authService
      .registrar(this.model())
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
}