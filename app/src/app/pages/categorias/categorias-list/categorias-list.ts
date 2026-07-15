import { Component, computed, inject, signal } from '@angular/core';
import { CategoriaService } from '../../../core/services/categoria.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Categoria } from '../../../core/models/categoria.model';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardContent,
    MatCard,
    MatIcon,
    MatButtonModule
  ],
  templateUrl: './categorias-list.html',
  styleUrl: './categorias-list.css',
})
export class CategoriasList {
  private readonly categoriaService = inject(CategoriaService);
  private readonly notificationService = inject(NotificationService);

  categorias = signal<Categoria[]>([]);
  search = signal('');
  estadoFiltro = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  displayedColumns = ['nombre', 'estado', 'acciones'];

estadosDisponibles = computed<string[]>(() => {
    const map = new Set<string>();
    this.categorias().forEach((categoria) => {
      if (categoria.estado) {
        map.add(categoria.estado);
      }
    });
    return Array.from(map.values());
  });

  categoriasFiltradas = computed(() => {
    const texto = this.search().trim().toLowerCase();
    const estado = this.estadoFiltro();
    return this.categorias().filter((c) => {
      const coincideBusqueda = c.nombre?.toLowerCase().includes(texto);
      const coincideEstado = estado === '' || c.estado === estado;

      return coincideBusqueda && coincideEstado;
    });
  });

  totalCategorias = computed(() => this.categoriasFiltradas().length);

  ngOnInit(): void { this.loadCategorias(); }

  loadCategorias(): void {
    this.loading.set(true);
    this.error.set(null);
    this.categoriaService.listar().subscribe({
      next: (res) => {
        this.categorias.set(res.data);
        this.loading.set(false);
        console.log('Categorías cargadas:', res.data);
      },
      error: () => { this.error.set('Error al cargar categorías.'); this.loading.set(false); }
    });
  }

  clearFilters(): void {
    this.search.set('');
    this.estadoFiltro.set('');
  }

  toggleEstado(categoria: Categoria): void {
    this.categoriaService.cambiarEstado(categoria.id).subscribe({
      next: (res) => {
        const categoriaActualizada = res.data;

        this.categorias.update((listaActual) =>
          listaActual.map((c) =>
            c.id === categoria.id ? { ...c, estado: categoriaActualizada.estado } : c
          )
        );
        const accion = categoriaActualizada.estado === 'ACTIVO' ? 'activado' : 'inactivo';
        this.notificationService.success(
          `La categoría ${categoria.nombre} fue ${accion} con éxito.`,
          'Estado Actualizado'
        );
      },
      error: (err) => {
        console.error('Error al cambiar el estado de la categoría', err);
      }
    });
  }
}
