import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import { CategoriaService } from '../../core/services/categoria.service';
import { ServiciosService } from '../../core/services/servicios.service';
import { ProfesionalService } from '../../core/services/profesional.service';

import { Categoria } from '../../core/models/categoria.model';
import { Servicio } from '../../core/models/servicio.model';
import { Profesional } from '../../core/models/profesional.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private readonly categoriaService = inject(CategoriaService);
  private readonly serviciosService = inject(ServiciosService);
  private readonly profesionalService = inject(ProfesionalService);

  categorias = signal<Categoria[]>([]);
  servicios = signal<Servicio[]>([]);
  profesionales = signal<Profesional[]>([]);

  loading = signal(true);
  error = signal<string | null>(null);

  totalCategorias = computed(() => this.categorias().length);
  totalServicios = computed(() => this.servicios().length);
  totalProfesionales = computed(() => this.profesionales().length);

  serviciosDestacados = computed(() =>
    this.servicios()
      .filter((s) => s.publicar !== false)
      .slice(0, 6)
  );

  profesionalesDestacados = computed(() => this.profesionales().slice(0, 4));

  categoriasConConteo = computed(() =>
    this.categorias()
      .filter((c) => c.estado === 'ACTIVO' || !c.estado)
      .map((categoria) => ({
        ...categoria,
        icono: this.iconoCategoria(categoria.nombre),
        totalServicios: this.servicios().filter(
          (s) => String(s.categoria) === categoria.nombre
        ).length,
      }))
  );

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      categorias: this.categoriaService.listar(),
      servicios: this.serviciosService.listar(),
      profesionales: this.profesionalService.listar(),
    }).subscribe({
      next: ({ categorias, servicios, profesionales }) => {
        this.categorias.set(categorias.data ?? []);
        this.servicios.set(servicios.data ?? []);
        this.profesionales.set(profesionales.data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los datos del sitio.');
        this.loading.set(false);
      },
    });
  }

  iconoCategoria(nombre: string): string {
    const iconos: Record<string, string> = {
      Cabello: 'content_cut',
      'Corte y Peinado': 'content_cut',
      Maquillaje: 'brush',
      'Maquillaje Profesional': 'brush',
      Uñas: 'clean_hands',
      'Manicura y Pedicura': 'clean_hands',
      Spa: 'spa',
      'Cuidado Facial': 'spa',
      Barbería: 'face_retouching_natural',
      'Tratamientos Faciales': 'face_retouching_natural',
    };
    return iconos[nombre] ?? 'auto_awesome';
  }

  getImagenServicio(nombre: string): string {
    return nombre ? this.serviciosService.getImageUrl(nombre) : '';
  }

  getImagenPerfil(nombre: string): string {
    return nombre ? this.profesionalService.getImageUrl(nombre) : '';
  }

  formatearPrecio(precio: number | string): string {
    const valor = Number(precio);
    if (isNaN(valor)) {
      return String(precio);
    }
    return new Intl.NumberFormat('es-CR').format(valor);
  }

  iniciales(nombre: string): string {
    if (!nombre) {
      return '?';
    }
    return nombre
      .trim()
      .split(/\s+/)
      .map((p) => p.charAt(0))
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
