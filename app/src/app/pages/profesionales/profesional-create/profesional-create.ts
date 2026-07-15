import { Component, inject, signal } from "@angular/core"
import { ProfesionalForm } from "../../../shared/components/profesional-form/profesional-form"
import { Router } from "@angular/router"
import { ProfesionalService } from "../../../core/services/profesional.service"
import { ProfesionalCreateDto, ProfesionalUpdateDto } from "../../../core/models/profesional.model"

@Component({
  selector: 'app-profesional-create',
  standalone: true,
  imports: [ProfesionalForm],
  templateUrl: './profesional-create.html',
})
export class ProfesionalCreate {
  private readonly router = inject(Router)
  private readonly profesionalService = inject(ProfesionalService)

  loading = signal(false)
  saving = signal(false)
  error = signal<string | null>(null)

  guardar(data: ProfesionalCreateDto | ProfesionalUpdateDto) {
    this.saving.set(true)
    this.error.set(null)
        console.log("Data: ", data)

    this.profesionalService.crear(data as ProfesionalCreateDto).subscribe({
      next: () => {
        this.router.navigate(['/profesionales'])
      },
      error: (err) => {
        this.error.set(err.error?.message || 'No se pudo registrar el perfil profesional')
        this.saving.set(false)
      },
      complete: () => {
        this.saving.set(false)
      },
    })
  }

  cancelar() {
    this.router.navigate(['/profesionales'])
  }
}
