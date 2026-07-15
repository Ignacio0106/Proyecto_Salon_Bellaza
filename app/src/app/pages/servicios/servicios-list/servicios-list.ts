import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ServiciosService } from '../../../core/services/servicios.service';
import { Servicio } from '../../../core/models/servicio.model';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-servicios-list',

  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink
  ],

  templateUrl: './servicios-list.html',
  styleUrl: './servicios-list.css'
})


export class ServiciosList {


  private readonly serviciosService = inject(ServiciosService);
  private readonly notificationService = inject(NotificationService);


  servicios = signal<Servicio[]>([]);
  search = signal('');
  categoria = signal('');
  modalidad = signal('');
  precioDesde = signal<number | null>(null);
  precioHasta = signal<number | null>(null);
  estadoFiltro = signal('');
  
  loading = signal(false);
  error = signal<string | null>(null);

estadosDisponibles = computed<string[]>(() => {
    const map = new Set<string>();
    this.servicios().forEach((servicio) => {
      if (servicio.estado) {
        map.add(servicio.estado);
      }
    });
    return Array.from(map.values());
  });

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.loading.set(true);
    this.error.set(null);

    this.serviciosService.listar()
      .subscribe({
        next: (response) => {
          this.servicios.set(response.data);
          this.loading.set(false);
        },

        error: () => {
          this.error.set(
            'No se pudieron cargar los servicios.'
          );
          this.loading.set(false);
        }
      });
  }

  categorias = computed(() => {
    return [
      ...new Set(
        this.servicios()
          .map(s => s.categoria as string)
      )
    ];
  });

  serviciosFiltrados = computed(() => {
    const texto =
      this.search()
        .toLowerCase()
        .trim();

    const categoriaSeleccionada =
      this.categoria();

    const modalidadSeleccionada =
      this.modalidad();

    const desde =
      this.precioDesde();

    const hasta =
      this.precioHasta();

    return this.servicios()
      .filter(servicio => {

        const coincideTexto =
          texto === '' ||
          servicio.nombre
            .toLowerCase()
            .includes(texto);

        const coincideCategoria =
          categoriaSeleccionada === '' ||
          servicio.categoria === categoriaSeleccionada;

        const coincideModalidad =
          modalidadSeleccionada === '' ||
          servicio.modalidad === modalidadSeleccionada;

        const precio = Number(servicio.precio);

        const coincideDesde =
          desde === null ||
          precio >= desde;

        const coincideHasta =
          hasta === null ||
          precio <= hasta;

        return (
          coincideTexto &&
          coincideCategoria &&
          coincideModalidad &&
          coincideDesde &&
          coincideHasta
        );
      });
  });

  totalServicios = computed(() =>
    this.serviciosFiltrados().length
  );

  clearFilters(): void {
    this.search.set('');
    this.categoria.set('');
    this.modalidad.set('');
    this.precioDesde.set(null);
    this.precioHasta.set(null);
  }

  toggleEstado(servicio: Servicio): void {
    this.serviciosService.cambiarEstado(servicio.id).subscribe({
      next: (res) => {
        const servicioActualizado = res.data;

        this.servicios.update((listaActual) =>
          listaActual.map((s) =>
            s.id === servicio.id ? { ...s, estado: servicioActualizado.estado } : s
          )
        );
        
        const accion = servicioActualizado.estado === 'ACTIVO' ? 'activado' : 'desactivado';
        this.notificationService.success(
          `El servicio "${servicio.nombre}" fue ${accion} con éxito.`,
          'Estado Actualizado'
        );
      },
      error: (err) => {
        console.error('Error al cambiar el estado del servicio', err);
        this.notificationService.error('No se pudo cambiar el estado del servicio.', 'Error');
      }
    });
  }
}
