import { Component, computed, effect, inject, input, output, signal } from "@angular/core"
import { FormsModule } from '@angular/forms';
import { ImageService } from "../../../core/services/image.service"
import { Profesional, ProfesionalCreateDto, ProfesionalFormModel, ProfesionalUpdateDto } from "../../../core/models/profesional.model"
import { form, min, minLength, pattern, required, FormField } from "@angular/forms/signals"
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOption } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Especialidad } from "../../../core/models/especialidad.model";
import { EspecialidadService } from "../../../core/services/especialidad.service";

@Component({
  selector: 'app-profesional-form',
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
    MatCheckboxModule,
  ],
  templateUrl: './profesional-form.html',
  styleUrl: './profesional-form.css',
})
export class ProfesionalForm {
  private readonly imageService = inject(ImageService)
  private readonly especialidadService = inject(EspecialidadService)

  profesional = input<Profesional | null>(null)
  saving = input<boolean>(false)

  guardar = output<ProfesionalCreateDto | ProfesionalUpdateDto>()
  cancelar = output<void>()

  uploadingImage = signal(false)
  imagePreview = signal<string | null>(null)
  selectedImageFile = signal<File | null>(null)
  especialidades = signal<Especialidad[]>([])
  especialidadIds = signal<number[]>([])

  profesionalModel = signal<ProfesionalFormModel>({
    nombre: '',
    apellidos: '',
    correo: '',
    telefono: '',
    tituloProfesional: '',
    descripcion: '',
    aniosExperiencia: 0,
    modalidad: 'VIRTUAL',
    provincia: '',
    canton: '',
    distrito: '',
    tarifaBase: 0,
    disponible: true,
    imagenPerfil: '',
    especialidadIds: [],
  })

  profesionalForm = form(this.profesionalModel, (path) => {
    required(path.nombre, {
      message: 'El nombre es obligatorio'
    })

    required(path.apellidos, {
      message: 'Los apellidos son obligatorios'
    })

    required(path.tituloProfesional, {
      message: 'El título profesional es obligatorio'
    })

    required(path.aniosExperiencia, {
      message: 'La experiencia es obligatoria'
    })
    min(path.aniosExperiencia, 0, {
      message: 'La experiencia no puede ser negativa'
    })
    required(path.tarifaBase, {
      message: 'La tarifa es obligatoria'
    })
    min(path.tarifaBase, 1, {
      message: 'La tarifa debe ser mayor a 0'
    })

    required(path.correo, {
      message: 'El correo es obligatorio'
    })

    pattern(path.correo, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: 'Correo inválido'
    })

    required(path.telefono, {
      message: 'El teléfono es obligatorio'
    })
    pattern(path.telefono, /^[0-9]{8}$/, {
      message: 'El teléfono debe tener exactamente 8 dígitos'
    })
    required(path.modalidad, {
      message: 'La modalidad es obligatoria'
    })

    required(path.provincia, {
      message: 'La provincia es obligatoria'
    })

    required(path.canton, {
      message: 'El cantón es obligatorio'
    })

    required(path.distrito, {
      message: 'El distrito es obligatorio'
    })

    minLength(path.descripcion, 10, {
      message: 'La descripción debe tener al menos 10 caracteres'
    })
  })

  isEdit = computed(() => this.profesional() !== null)

  isSubmitting = computed(() => this.saving() || this.uploadingImage())

  constructor() {
    this.cargarEspecialidades()

    effect(() => {
      const prof = this.profesional()
      if (!prof) {
        this.resetForm()
        return
      }
      this.profesionalModel.set({
        nombre: prof.nombre ?? '',
        apellidos: prof.apellidos ?? '',
        correo: prof.correo ?? '',
        telefono: prof.telefono ?? '',
        tituloProfesional: prof.tituloProfesional ?? '',
        descripcion: prof.descripcion ?? '',
        aniosExperiencia: prof.aniosExperiencia ?? 0,
        modalidad: prof.modalidad ?? 'VIRTUAL',
        provincia: prof.provincia ?? '',
        canton: prof.canton ?? '',
        distrito: prof.distrito ?? '',
        tarifaBase: Number(prof.tarifaBase ?? 0),
        disponible: prof.disponible ?? true,
        imagenPerfil: prof.imagenPerfil ?? '',
        especialidadIds: prof.especialidades?.map((especialidad) => especialidad.id) ?? [],
      })
      this.selectedImageFile.set(null)
      this.imagePreview.set(
        prof.imagenPerfil ? this.imageService.getImageUrl(prof.imagenPerfil) : null
      )
      this.especialidadIds.set(prof.especialidades?.map((especialidad) => especialidad.id) ?? [])
    })
  }

  private cargarEspecialidades() {
    this.especialidadService.listar().subscribe({
      next: (response) => {
        this.especialidades.set(response.data ?? [])
      },
      error: () => {
        alert('No se pudieron cargar las especialidades')
      },
    })
  }

  private resetForm() {
    this.profesionalModel.set({
      nombre: '',
      apellidos: '',
      correo: '',
      telefono: '',
      tituloProfesional: '',
      descripcion: '',
      aniosExperiencia: 0,
      modalidad: 'VIRTUAL',
      provincia: '',
      canton: '',
      distrito: '',
      tarifaBase: 0,
      disponible: true,
      imagenPerfil: '',
      especialidadIds: [],
    })
    this.selectedImageFile.set(null)
    this.imagePreview.set(null)
    this.especialidadIds.set([])
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    this.selectedImageFile.set(file)
    this.imagePreview.set(URL.createObjectURL(file))
  }

  submit() {
    if (this.isSubmitting()) return
    this.marcarCamposComoTocados()
    if (this.formularioInvalido()) return

    const file = this.selectedImageFile()
    if (file) {
      this.subirImagenYGuardar(file)
      return
    }
    this.emitirGuardar()
  }

  private marcarCamposComoTocados() {
    this.profesionalForm.nombre().markAsTouched()
    this.profesionalForm.apellidos().markAsTouched()
    this.profesionalForm.correo().markAsTouched()
    this.profesionalForm.telefono().markAsTouched()
    this.profesionalForm.tituloProfesional().markAsTouched()
    this.profesionalForm.descripcion().markAsTouched()
    this.profesionalForm.aniosExperiencia().markAsTouched()
    this.profesionalForm.modalidad().markAsTouched()
    this.profesionalForm.provincia().markAsTouched()
    this.profesionalForm.canton().markAsTouched()
    this.profesionalForm.distrito().markAsTouched()
    this.profesionalForm.tarifaBase().markAsTouched()
  }

  private formularioInvalido(): boolean {
    return (
      this.profesionalForm.nombre().invalid() ||
      this.profesionalForm.apellidos().invalid() ||
      this.profesionalForm.correo().invalid() ||
      this.profesionalForm.telefono().invalid() ||
      this.profesionalForm.tituloProfesional().invalid() ||
      this.profesionalForm.descripcion().invalid() ||
      this.profesionalForm.aniosExperiencia().invalid() ||
      this.profesionalForm.modalidad().invalid() ||
      this.profesionalForm.provincia().invalid() ||
      this.profesionalForm.canton().invalid() ||
      this.profesionalForm.distrito().invalid() ||
      this.profesionalForm.tarifaBase().invalid() ||
      this.especialidadIds().length === 0
    )
  }

  private subirImagenYGuardar(file: File) {
    this.uploadingImage.set(true)
    this.imageService.upload(file).subscribe({
      next: (response) => {
        this.profesionalModel.update((value) => ({
          ...value,
          imagenPerfil: response.fileName,
        }))
        this.selectedImageFile.set(null)
        this.emitirGuardar()
      },
      error: () => {
        alert('No se pudo subir la imagen')
      },
      complete: () => {
        this.uploadingImage.set(false)
      },
    })
  }
  private emitirGuardar() {
    const dto = this.buildDto()
    console.log('JSON enviado al API:', dto)
    this.guardar.emit(dto)
  }
  private buildDto(): ProfesionalCreateDto | ProfesionalUpdateDto {
    const value = this.profesionalModel()
    return {
      nombre: value.nombre.trim(),
      apellidos: value.apellidos.trim(),
      correo: value.correo.trim(),
      telefono: value.telefono.trim(),
      tituloProfesional: value.tituloProfesional.trim(),
      descripcion: value.descripcion.trim(),
      provincia: value.provincia.trim() ?? '',
      canton: value.canton.trim() ?? '',
      distrito: value.distrito.trim() ?? '',
      modalidad: value.modalidad!,
      tarifaBase: Number(value.tarifaBase),
      aniosExperiencia: Number(value.aniosExperiencia),
      disponible: value.disponible,
      imagenPerfil: value.imagenPerfil.trim(),
      especialidadIds: this.especialidadIds(),
    }
  }
}