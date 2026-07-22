import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';
import { finalize } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/usuario.model';


@Component({
  selector: 'app-login',
  imports: [RouterLink,
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly submitted = signal(false);
  readonly ocultarPassword = signal(true);
  readonly enviando = signal(false);
  readonly errorServidor = signal<string | null>(null);
  readonly model = signal<LoginRequest>({ correo: '', contrasena: '' });

  readonly loginForm = form(this.model, (path) => {
    required(path.correo, { message: 'El correo es obligatorio.' });
    email(path.correo, { message: 'Ingrese un correo válido.' });
    required(path.contrasena, { message: 'La contraseña es obligatoria.' });
    minLength(path.contrasena, 6, {
      message: 'La contraseña debe tener al menos 6 caracteres.',
    });
  });

  submit(): void {
    this.submitted.set(true);

    if (this.loginForm().invalid()) {
      return;
    }

    this.enviando.set(true);
    this.errorServidor.set(null);
    this.authService.login(this.model())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          const returnUrl =
            this.route.snapshot.queryParamMap.get('returnUrl') ?? '/inicio';
          void this.router.navigateByUrl(returnUrl);
        },
        error: (error) => {
          this.errorServidor.set(
            error.error?.message ?? 'No fue posible iniciar sesión.'
          );
        },
      });
  }
}

