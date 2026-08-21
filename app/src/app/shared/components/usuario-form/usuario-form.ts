import { Component, computed, effect, input, output, signal } from '@angular/core';
import { RegisterRequest, UsuarioCreateDto, UsuarioFormModel, UsuarioUpdateDto } from '../../../core/models/usuario.model';
import { Role } from '../../../core/models/role.model';
import { form, FormField, email, minLength, required } from '@angular/forms/signals';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-usuario-form',
  imports: [
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOption,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm {
  readonly RolEnum = Role

  usuario = input<RegisterRequest | null>(null)
  saving = input<boolean>(false)
  mostrarRol = input<boolean>(false)
  mostrarCancelar = input<boolean>(true)

  guardar = output<UsuarioCreateDto | UsuarioUpdateDto>()
  cancelar = output<void>()

  ocultarPassword = signal(true)

  usuarioModel = signal<UsuarioFormModel>({
    nombre: '',
    correo: '',
    telefono: '',
    apellidos: '',
    password: '',
    rol: Role.CLIENTE,
  })

  usuarioForm = form(this.usuarioModel, (path) => {
    required(path.nombre, { message: 'El nombre es obligatorio.' });
    required(path.apellidos, { message: 'Los apellidos son obligatorios.' });
    required(path.correo, { message: 'El correo es obligatorio.' });
    email(path.correo, { message: 'Ingrese un correo válido.' });
    required(path.telefono, { message: 'El teléfono es obligatorio.' });
    minLength(path.telefono, 8, { message: 'El teléfono debe tener al menos 8 dígitos.' });
  })

  isEdit = computed(() => this.usuario() !== null)

  isSubmitting = computed(() => this.saving())

  // En registro la contraseña es obligatoria; al editar es opcional.
  passwordRequerido = computed(() => !this.isEdit())

  passwordInvalido = computed(() => {
    const valor = this.usuarioModel().password ?? ''
    if (this.passwordRequerido()) {
      return valor.trim().length < 6
    }
    return valor.length > 0 && valor.trim().length < 6
  })

  passwordErrorMessage = computed(() => {
    const valor = this.usuarioModel().password ?? ''
    if (this.passwordRequerido() && valor.trim().length === 0) {
      return 'La contraseña es obligatoria.'
    }
    if (valor.trim().length > 0 && valor.trim().length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    return ''
  })

  constructor() {
    effect(() => {
      const user = this.usuario()
      if (!user) {
        this.resetForm()
        return
      }
      this.usuarioModel.set({
        nombre: user.nombre ?? '',
        correo: user.correo ?? '',
        telefono: user.telefono ?? '',
        apellidos: user.apellidos ?? '',
        password: user.contrasena ?? '',
        rol: Role.CLIENTE,
      })
    })
  }

  private resetForm() {
    this.usuarioModel.set({
      nombre: '',
      correo: '',
      telefono: '',
      apellidos: '',
      password: '',
      rol: Role.CLIENTE,
    })
  }

  submit() {
    if (this.isSubmitting()) return
    this.marcarCamposComoTocados()
    if (this.formularioInvalido()) return
    this.emitirGuardar()
  }

  private marcarCamposComoTocados() {
    this.usuarioForm.nombre().markAsTouched()
    this.usuarioForm.apellidos().markAsTouched()
    this.usuarioForm.correo().markAsTouched()
    this.usuarioForm.password().markAsTouched()
    this.usuarioForm.telefono().markAsTouched()
    this.usuarioForm.rol().markAsTouched()
  }

  private formularioInvalido(): boolean {
    return (
      this.usuarioForm.nombre().invalid() ||
      this.usuarioForm.apellidos().invalid() ||
      this.usuarioForm.correo().invalid() ||
      this.usuarioForm.telefono().invalid() ||
      this.passwordInvalido()
    )
  }

  private emitirGuardar() {
    const dto = this.buildDto()
    console.log('JSON enviado al API:', dto)
    this.guardar.emit(dto)
  }

  private buildDto(): UsuarioCreateDto | UsuarioUpdateDto {
    const value = this.usuarioModel()
    const dto: UsuarioCreateDto | UsuarioUpdateDto = {
      nombre: value.nombre.trim(),
      apellidos: value.apellidos.trim(),
      correo: value.correo.trim(),
      telefono: value.telefono.trim(),
      rol: value.rol,
    }
    const password = value.password.trim()
    if (password.length > 0) {
      dto.password = password
    }
    return dto
  }
}