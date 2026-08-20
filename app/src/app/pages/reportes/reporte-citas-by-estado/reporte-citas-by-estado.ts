import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexYAxis,
  ApexDataLabels,
  ApexPlotOptions,
  ApexLegend,
  ApexStroke,
  ApexFill,
  ApexTooltip,
  ApexGrid,
  ApexResponsive,
  NgApexchartsModule,
} from 'ng-apexcharts';

import { ReporteService } from '../../../core/services/reporte.service';
import { ReporteCitasPorEstado } from '../../../core/models/reporte.model';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDatepicker } from "@angular/material/datepicker";

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  colors: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  responsive: ApexResponsive[];
};

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  colors: string[];
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  tooltip: ApexTooltip;
};

@Component({
  selector: 'app-reporte-citas-by-estado',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgApexchartsModule,
    TitleCasePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    MatDatepicker
],
  templateUrl: './reporte-citas-by-estado.html',
  styleUrl: './reporte-citas-by-estado.css',
})
export class ReporteCitasByEstado {
  private readonly fb = inject(FormBuilder);
  private readonly reporteService = inject(ReporteService);
  
  readonly hoy = new Date().toISOString().split('T')[0];

  filterForm!: FormGroup;
  loading = false;
  errorMessage: string | null = null;

  // Colecciones de datos
  citasOriginales: ReporteCitasPorEstado[] = [];
  citasFiltradas: ReporteCitasPorEstado[] = [];

  // Opciones dinámicas para selects
  profesionales: string[] = [];
  categorias: string[] = [];

   displayedColumns = ['fecha', 'cliente', 'profesional', 'servicio', 'monto', 'estado'];

  // Paleta de colores por estado (consistente en toda la vista)
  private readonly coloresEstado = {
    PENDIENTE: '#d99b00',
    ACEPTADA: '#466368',
    RECHAZADA: '#a83449',
    CANCELADA: '#797675',
    COMPLETADA: '#2e7d32',
  };

  // Métricas
  totalesPorEstado = {
    PENDIENTE: 0,
    ACEPTADA: 0,
    RECHAZADA: 0,
    CANCELADA: 0,
    COMPLETADA: 0,
  };

  porcentajesPorEstado = {
    PENDIENTE: 0,
    ACEPTADA: 0,
    RECHAZADA: 0,
    CANCELADA: 0,
    COMPLETADA: 0,
  };

  totalGeneral = 0;
  montoTotal = 0;

  // ==== Configuración de gráficos ====
  donutChartOptions: DonutChartOptions = this.initDonutChart();
  barChartOptions: BarChartOptions = this.initBarChart();

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      fechaInicio: [''],
      fechaFin: [''],
      profesionalNombre: [''],
      categoriaNombre: ['']
    });

    this.cargarDatos();

    this.filterForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosYCalcular();
    });
  }

  cargarDatos(): void {
    this.loading = true;
    this.errorMessage = null;

    this.reporteService.citasPorEstado().subscribe({
      next: (res: any) => {
        const items = res?.data?.registros || res?.data || [];
        this.citasOriginales = items;

        this.extraerOpcionesFiltro();
        this.aplicarFiltrosYCalcular();
        this.loading = false;
      },
      error: (err: any) => {
        this.errorMessage = err.error?.message || 'Ocurrió un error al cargar el reporte';
        this.loading = false;
      }
    });
  }

  extraerOpcionesFiltro(): void {
    const profSet = new Set<string>();
    const catSet = new Set<string>();

    this.citasOriginales.forEach(c => {
      if (c.profesional?.usuario) {
        profSet.add(`${c.profesional.usuario.nombre} ${c.profesional.usuario.apellidos}`);
      }
      if (c.servicio?.categoria?.nombre) {
        catSet.add(c.servicio.categoria.nombre);
      }
    });

    this.profesionales = Array.from(profSet).sort();
    this.categorias = Array.from(catSet).sort();
  }

  aplicarFiltrosYCalcular(): void {
    this.errorMessage = null;
    const { fechaInicio, fechaFin, profesionalNombre, categoriaNombre } = this.filterForm.value;

    if (fechaInicio && fechaFin && new Date(fechaInicio) > new Date(fechaFin)) {
      this.errorMessage = 'La fecha de inicio no puede ser posterior a la fecha final.';
      this.citasFiltradas = [];
      this.reiniciarMetricas();
      this.actualizarGraficos();
      return;
    }

    this.citasFiltradas = this.citasOriginales.filter(cita => {
      const fechaCita = new Date(cita.fechaCitaSolicitada);

      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        if (fechaCita < inicio) return false;
      }

      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        if (fechaCita > fin) return false;
      }

      if (profesionalNombre) {
        const nombreCompleto = `${cita.profesional?.usuario?.nombre} ${cita.profesional?.usuario?.apellidos}`;
        if (nombreCompleto !== profesionalNombre) return false;
      }

      if (categoriaNombre) {
        if (cita.servicio?.categoria?.nombre !== categoriaNombre) return false;
      }

      return true;
    });

    this.calcularTotales();
    this.actualizarGraficos();
  }

  calcularTotales(): void {
    this.reiniciarMetricas();
    this.totalGeneral = this.citasFiltradas.length;

    if (this.totalGeneral === 0) return;

    this.citasFiltradas.forEach(cita => {
      const estado = cita.estado as keyof typeof this.totalesPorEstado;
      if (this.totalesPorEstado[estado] !== undefined) {
        this.totalesPorEstado[estado]++;
      }
      this.montoTotal += Number(cita.montoCalculado) || 0;
    });

    Object.keys(this.totalesPorEstado).forEach(key => {
      const k = key as keyof typeof this.totalesPorEstado;
      this.porcentajesPorEstado[k] = Number(((this.totalesPorEstado[k] / this.totalGeneral) * 100).toFixed(1));
    });
  }

  reiniciarMetricas(): void {
    this.totalGeneral = 0;
    this.montoTotal = 0;
    this.totalesPorEstado = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0, CANCELADA: 0, COMPLETADA: 0 };
    this.porcentajesPorEstado = { PENDIENTE: 0, ACEPTADA: 0, RECHAZADA: 0, CANCELADA: 0, COMPLETADA: 0 };
  }

  limpiarFiltros(): void {
    this.filterForm.reset({
      fechaInicio: '',
      fechaFin: '',
      profesionalNombre: '',
      categoriaNombre: ''
    });
  }

  // ==================== GRÁFICOS ====================

  private actualizarGraficos(): void {
    this.actualizarDonutChart();
    this.actualizarBarChart();
    this.actualizarLineChart();
  }

  private actualizarDonutChart(): void {
    const estados = Object.keys(this.totalesPorEstado) as (keyof typeof this.totalesPorEstado)[];
    this.donutChartOptions = {
      ...this.donutChartOptions,
      series: estados.map(e => this.totalesPorEstado[e])
    };
  }

  private actualizarBarChart(): void {
    const conteoPorProfesional = new Map<string, number>();

    this.citasFiltradas.forEach(c => {
      const nombre = `${c.profesional?.usuario?.nombre ?? ''} ${c.profesional?.usuario?.apellidos ?? ''}`.trim();
      if (!nombre) return;
      conteoPorProfesional.set(nombre, (conteoPorProfesional.get(nombre) || 0) + 1);
    });

    const top5 = Array.from(conteoPorProfesional.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // ⚠️ Reemplazar el objeto completo, no mutarlo
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [{
        name: 'Citas',
        data: top5.map(([, total]) => total)
      }],
      xaxis: {
        ...this.barChartOptions.xaxis,
        categories: top5.map(([nombre]) => nombre)
      }
    };
  }

  private actualizarLineChart(): void {
    const conteoPorFecha = new Map<string, number>();

    this.citasFiltradas.forEach(c => {
      const fecha = new Date(c.fechaCitaSolicitada);
      const clave = fecha.toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit' });
      conteoPorFecha.set(clave, (conteoPorFecha.get(clave) || 0) + 1);
    });

    const fechasOrdenadas = Array.from(conteoPorFecha.entries()).sort((a, b) => {
      const [dA, mA] = a[0].split('/').map(Number);
      const [dB, mB] = b[0].split('/').map(Number);
      return mA === mB ? dA - dB : mA - mB;
    });
  }

  private initDonutChart(): DonutChartOptions {
    return {
      series: [0, 0, 0, 0, 0],
      chart: { type: 'donut', height: 300, fontFamily: 'inherit' },
      labels: ['Pendiente', 'Aceptada', 'Rechazada', 'Cancelada', 'Completada'],
      colors: [
        this.coloresEstado.PENDIENTE,
        this.coloresEstado.ACEPTADA,
        this.coloresEstado.RECHAZADA,
        this.coloresEstado.CANCELADA,
        this.coloresEstado.COMPLETADA,
      ],
      legend: { position: 'bottom', fontSize: '13px', fontWeight: 500 },
      dataLabels: { enabled: true, style: { fontSize: '12px', fontWeight: 600 } },
      stroke: { width: 2, colors: ['#ffffff'] },
      tooltip: { y: { formatter: (val: number) => `${val} citas` } },
      responsive: [{
        breakpoint: 480,
        options: { chart: { height: 260 }, legend: { position: 'bottom' } }
      }]
    };
  }

  private initBarChart(): BarChartOptions {
    return {
      series: [{ name: 'Citas', data: [] }],
      chart: { type: 'bar', height: 300, fontFamily: 'inherit', toolbar: { show: false } },
      xaxis: { categories: [], labels: { style: { fontSize: '11px' } } },
      yaxis: { labels: { style: { fontSize: '12px' } } },
      colors: ['#466368'],
      plotOptions: {
        bar: { horizontal: true, borderRadius: 6, barHeight: '55%' }
      },
      dataLabels: { enabled: true, style: { fontSize: '12px', colors: ['#1c1b1b'] }, offsetX: 20 },
      grid: { borderColor: '#ece7e6', strokeDashArray: 4 },
      tooltip: { y: { formatter: (val: number) => `${val} citas` } }
    };
  }
}