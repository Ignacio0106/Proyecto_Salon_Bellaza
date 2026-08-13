import { Component, computed, effect, inject, input, output, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { forkJoin } from 'rxjs'
import { form, FormField, maxLength, min, minLength, required } from '@angular/forms/signals'

import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatOption } from '@angular/material/core'
import { MatIconModule } from '@angular/material/icon'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'
import { MatButtonModule } from '@angular/material/button'

import { Categoria } from '../../../core/models/categoria.model'
import { Profesional } from '../../../core/models/profesional.model'
import { Especialidad } from '../../../core/models/especialidad.model'
import {
  ServicioCreateDto,
  ServicioDetalle,
  ServicioUpdateDto,
} from '../../../core/models/servicio.model'

import { CategoriaService } from '../../../core/services/categoria.service'
import { ProfesionalService } from '../../../core/services/profesional.service'
import { EspecialidadService } from '../../../core/services/especialidad.service'
import { AuthService } from '../../../core/services/auth.service'

export interface ServicioFormModel {
  profesionalId: number | null
  categoriaId: number | null
  nombre: string
  descripcion: string
  precio: number
  duracionEstimada: number
  modalidad: string
  estado: string
}

export const SERVICIO_FORM_DEFAULTS: ServicioFormModel = {
  profesionalId: null,
  categoriaId: null,
  nombre: '',
  descripcion: '',
  precio: 0,
  duracionEstimada: 0,
  modalidad: '',
  estado: 'ACTIVO',
}

@Component({
  selector: 'app-servicio-form',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormField,
    MatOption,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
  ],
  templateUrl: './servicio-form.html',
  styleUrl: './servicio-form.css',
})
export class ServicioForm {
  private readonly categoriaService = inject(CategoriaService)
  private readonly profesionalService = inject(ProfesionalService)
  private readonly especialidadService = inject(EspecialidadService)
  private readonly authService = inject(AuthService)

  servicio = input<ServicioDetalle | null>(null)
  saving = input<boolean>(false)

  guardar = output<ServicioCreateDto | ServicioUpdateDto>()
  cancelar = output<void>()

  loading = signal(false)
  categorias = signal<Categoria[]>([])
  profesionales = signal<Profesional[]>([])
  especialidades = signal<Especialidad[]>([])
  especialidadIds = signal<number[]>([])

  servicioModel = signal<ServicioFormModel>({ ...SERVICIO_FORM_DEFAULTS })

  servicioForm = form(this.servicioModel, (path) => {
    required(path.nombre, {
      message: 'El nombre es obligatorio',
    })
    maxLength(path.nombre, 150, {
      message: 'El nombre no puede superar 150 caracteres',
    })

    required(path.descripcion, {
      message: 'La descripción es obligatoria',
    })
    minLength(path.descripcion, 10, {
      message: 'La descripción debe tener al menos 10 caracteres',
    })
    maxLength(path.descripcion, 1000, {
      message: 'La descripción no puede superar 1000 caracteres',
    })

    required(path.precio, {
      message: 'El precio es obligatorio',
    })
    min(path.precio, 1, {
      message: 'El precio debe ser mayor a cero',
    })

    required(path.duracionEstimada, {
      message: 'La duración es obligatoria',
    })
    min(path.duracionEstimada, 1, {
      message: 'La duración debe ser mayor a cero',
    })

    required(path.modalidad, {
      message: 'La modalidad es obligatoria',
    })

    required(path.estado, {
      message: 'El estado es obligatorio',
    })

    required(path.profesionalId, {
      message: 'El profesional es obligatorio',
    })

    required(path.categoriaId, {
      message: 'La categoría es obligatoria',
    })
  })

  isEdit = computed(() => this.servicio() !== null)

  isSubmitting = computed(() => this.saving())

  esAdmin = computed(() => this.authService.esAdmin())

  profesionalesVisibles = computed(() => {
    if (this.esAdmin()) {
      return this.profesionales()
    }
    const perfilId =
      this.authService.usuario()?.perfilProfesionalId
    if (perfilId == null) {
      return []
    }
    return this.profesionales().filter(
      (profesional) => profesional.id === perfilId
    )
  })

  constructor() {
    this.cargarDatosFormulario()

    effect(() => {
      const servicio = this.servicio()
      if (!servicio) {
        this.resetForm()
        return
      }
      this.servicioModel.set({
        profesionalId: servicio.profesionalId ?? null,
        categoriaId: servicio.categoriaId ?? null,
        nombre: servicio.nombre ?? '',
        descripcion: servicio.descripcion ?? '',
        precio: Number(servicio.precio ?? 0),
        duracionEstimada: Number(servicio.duracionEstimada ?? 0),
        modalidad: servicio.modalidad ?? '',
        estado: servicio.estado ?? 'ACTIVO',
      })
      this.especialidadIds.set(
        servicio.especialidades?.map((especialidad) => especialidad.id) ?? []
      )
    })
  }

  private cargarDatosFormulario() {
    this.loading.set(true)

    forkJoin({
      categorias: this.categoriaService.listar(),
      profesionales: this.profesionalService.listar(),
      especialidades: this.especialidadService.listar(),
    }).subscribe({
      next: (response) => {
        this.categorias.set(response.categorias.data ?? [])
        const profesionales = response.profesionales.data ?? []
        this.profesionales.set(profesionales)
        this.especialidades.set(response.especialidades.data ?? [])
        this.preseleccionarProfesionalPropio(profesionales)
        this.loading.set(false)
      },
      error: () => {
        this.loading.set(false)
        alert('No se pudieron cargar los datos del formulario')
      },
    })
  }

  private preseleccionarProfesionalPropio(
    profesionales: Profesional[]
  ): void {
    if (this.esAdmin()) {
      return
    }
    const perfilId =
      this.authService.usuario()?.perfilProfesionalId
    if (perfilId == null) {
      return
    }
    const profesionalPropio = profesionales.find(
      (profesional) => profesional.id === perfilId
    )
    if (profesionalPropio) {
      this.servicioModel.update((modelo) => ({
        ...modelo,
        profesionalId: perfilId,
      }))
    }
  }

  private resetForm() {
    this.servicioModel.set({ ...SERVICIO_FORM_DEFAULTS })
    this.especialidadIds.set([])
  }

  submit() {
    if (this.isSubmitting()) return
    this.marcarCamposComoTocados()
    if (this.formularioInvalido()) return
    this.guardar.emit(this.buildDto())
  }

  private marcarCamposComoTocados() {
    this.servicioForm.nombre().markAsTouched()
    this.servicioForm.descripcion().markAsTouched()
    this.servicioForm.precio().markAsTouched()
    this.servicioForm.duracionEstimada().markAsTouched()
    this.servicioForm.modalidad().markAsTouched()
    this.servicioForm.estado().markAsTouched()
    this.servicioForm.profesionalId().markAsTouched()
    this.servicioForm.categoriaId().markAsTouched()
  }

  private formularioInvalido(): boolean {
    return (
      this.servicioForm.nombre().invalid() ||
      this.servicioForm.descripcion().invalid() ||
      this.servicioForm.precio().invalid() ||
      this.servicioForm.duracionEstimada().invalid() ||
      this.servicioForm.modalidad().invalid() ||
      this.servicioForm.estado().invalid() ||
      this.servicioForm.profesionalId().invalid() ||
      this.servicioForm.categoriaId().invalid() ||
      this.especialidadIds().length === 0
    )
  }

  private buildDto(): ServicioCreateDto | ServicioUpdateDto {
    const value = this.servicioModel()
    return {
      profesionalId: Number(value.profesionalId),
      categoriaId: Number(value.categoriaId),
      nombre: value.nombre.trim(),
      descripcion: value.descripcion.trim(),
      precio: Number(value.precio),
      duracionEstimada: Number(value.duracionEstimada),
      modalidad: value.modalidad,
      estado: value.estado,
      especialidadIds: this.especialidadIds(),
    }
  }
}
