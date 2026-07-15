import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ProfesionalService } from '../../../core/services/profesional.service';
import { ImageService } from '../../../core/services/image.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Profesional } from '../../../core/models/profesional.model';

@Component({
  selector: 'app-profesionales-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterLink
  ],
  templateUrl: './profesional-detail.html',
  styleUrl: './profesional-detail.css'
})

export class ProfesionalDetail {

  private readonly route = inject(ActivatedRoute);
  private readonly profesionalService = inject(ProfesionalService);
  private readonly imageService = inject(ImageService);

  profesional = signal<Profesional | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  imagenUrl = computed(() => {
    const profesional = this.profesional();
    return profesional?.imagenPerfil ? this.imageService.getImageUrl(profesional.imagenPerfil) : null;
  });

  iniciales = computed(() => {
    const nombre = this.profesional()?.nombre ?? '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  });



  ngOnInit() {
    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );
        if (!id) {
      this.error.set('El identificador del profesional no es válido.');
      return;
    }
    this.loadProfesional(id);

  }
  loadProfesional(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.profesionalService.obtenerPorId(id).subscribe({
        next: (response) => {
          console.log("Como llega",response);
          this.profesional.set(response.data ?? null);
          this.loading.set(false);
        },
        error: (err) => {
          console.error(err);
          this.error.set(
            "No se pudo cargar el profesional"
          );
          this.loading.set(false);
        }
      });
  }
    getImageUrl(imageName: string): string {
    return this.profesionalService.getImageUrl(imageName);
  }
}