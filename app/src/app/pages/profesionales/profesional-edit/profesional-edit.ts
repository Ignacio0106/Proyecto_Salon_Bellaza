import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { Profesional, ProfesionalCreateDto, ProfesionalUpdateDto } from '../../../core/models/profesional.model';
import { forkJoin } from 'rxjs';
import { ProfesionalForm } from "../../../shared/components/profesional-form/profesional-form";
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profesional-edit',
    standalone: true,
    imports: [ProfesionalForm],
  templateUrl: './profesional-edit.html',
  styleUrl: './profesional-edit.css',
})
export class ProfesionalEdit {
    private readonly route = inject(ActivatedRoute)
    private readonly router = inject(Router)
    private readonly profesionalService = inject(ProfesionalService)
    private readonly notificationService = inject(NotificationService)

    profesional = signal<Profesional | null>(null)

    loading = signal(true)
    saving = signal(false)
    error = signal<string | null>(null)
    private readonly id = Number(this.route.snapshot.paramMap.get('id'))
    constructor() {
        this.cargarDatosFormulario()
    }
    cargarDatosFormulario() {
        if (!this.id) {
            this.error.set('El identificador del profesional no es válido')
            this.loading.set(false)
            return
        }
        this.loading.set(true)
        this.error.set(null)
        forkJoin({
            profesional: this.profesionalService.obtenerPorId(this.id),
        }).subscribe({
            next: ({ profesional }) => {
                this.profesional.set(profesional.data ?? null)
            },
            error: () => {
                this.error.set('No se pudo cargar la información del profesional')
            },
            complete: () => {
                this.loading.set(false)
            },
        })
    }
    guardar(data: ProfesionalCreateDto | ProfesionalUpdateDto) {
        if (!this.id) return
        this.saving.set(true)
        this.profesionalService
            .editar(this.id, data as ProfesionalUpdateDto)
            .subscribe({
                next: () => {
                    this.router.navigate(['/profesionales'])
                },
                error: (err) => {
                    this.notificationService.warning(
                        err.error?.message || 'No se pudo actualizar el profesional',
                        'Datos no válidos'
                    )
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
