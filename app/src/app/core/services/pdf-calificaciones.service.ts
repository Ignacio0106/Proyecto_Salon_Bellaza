import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReporteDeCalificaciones } from '../models/reporte.model';

@Injectable({ providedIn: 'root' })
export class PdfCalificacionesService {
  private readonly margen = 40;

  exportarCalificaciones(
    datos: ReporteDeCalificaciones[],
    generadoPor: string,
    umbralBajo: number,
    maxPromedio: number
  ): void {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const anchoPagina = doc.internal.pageSize.getWidth();

    const fechaGeneracion = new Date().toLocaleString('es-CR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    // ── Encabezado ──────────────────────────────────────────────────────
    this.dibujarEncabezado(doc, anchoPagina);

    // ── Título ──────────────────────────────────────────────────────────
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Reporte de Calificaciones por Profesional', this.margen, 65);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text(`Fecha de generación: ${fechaGeneracion}`, this.margen, 82);
    doc.text(
      `Umbral de baja calificación: promedio < ${umbralBajo.toFixed(1)}★`,
      this.margen, 96
    );
    doc.setTextColor(0);

    // ── Tabla ────────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: 114,
      margin: { left: this.margen, right: this.margen },
      head: [[
        'Profesional',
        'Título profesional',
        'Promedio ★',
        'Reseñas',
        'Estado',
      ]],
      body: datos.map((fila) => {
        let estado: string;
        if (fila.cantidadResenas === 0) {
          estado = 'Sin reseñas';
        } else if (fila.promedioCalificacion === maxPromedio) {
          estado = 'Mejor calificado';
        } else if (fila.promedioCalificacion < umbralBajo) {
          estado = 'Baja calificación';
        } else {
          estado = 'Normal';
        }

        return [
          fila.profesional,
          fila.tituloProfesional || 'No especificado',
          fila.cantidadResenas > 0
            ? fila.promedioCalificacion.toFixed(1)
            : '—',
          fila.cantidadResenas.toString(),
          estado,
        ];
      }),
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      // Colorea filas según estado
      didParseCell: (hookData) => {
        if (hookData.section !== 'body') return;
        const fila = datos[hookData.row.index];
        if (!fila) return;

        if (fila.cantidadResenas > 0 && fila.promedioCalificacion === maxPromedio) {
          hookData.cell.styles.fillColor = [255, 249, 196]; // amarillo suave
        } else if (fila.cantidadResenas > 0 && fila.promedioCalificacion < umbralBajo) {
          hookData.cell.styles.fillColor = [255, 235, 238]; // rojo suave
        }
      },
      didDrawPage: () => {
        if (doc.getNumberOfPages() > 1) {
          this.dibujarEncabezado(doc, anchoPagina);
        }
      },
    });

    // ── Totales ──────────────────────────────────────────────────────────
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY;

    const conResenas    = datos.filter(f => f.cantidadResenas > 0);
    const totalResenas  = datos.reduce((a, f) => a + f.cantidadResenas, 0);
    const promedioGlobal = conResenas.length
      ? conResenas.reduce((a, f) => a + f.promedioCalificacion, 0) / conResenas.length
      : 0;
    const bajosCount = conResenas.filter(f => f.promedioCalificacion < umbralBajo).length;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de reseñas: ${totalResenas}`, this.margen, finalY + 24);
    doc.text(
      `Promedio global: ${promedioGlobal.toFixed(1)}★`,
      this.margen, finalY + 40
    );
    doc.text(
      `Profesionales con baja calificación: ${bajosCount}`,
      this.margen, finalY + 56
    );

    // ── Pie de página ────────────────────────────────────────────────────
    const alturaPagina = doc.internal.pageSize.getHeight();
    const totalPaginas = doc.getNumberOfPages();

    for (let pagina = 1; pagina <= totalPaginas; pagina++) {
      doc.setPage(pagina);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(120);
      doc.text(`Generado por: ${generadoPor}`, this.margen, alturaPagina - 20);
      doc.text(
        `Página ${pagina} de ${totalPaginas}`,
        anchoPagina - this.margen,
        alturaPagina - 20,
        { align: 'right' }
      );
    }

    doc.save('reporte-calificaciones.pdf');
  }

  private dibujarEncabezado(doc: jsPDF, anchoPagina: number): void {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Naturale - Beauty Marketplace', this.margen, 30);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('Reporte de Calificaciones', anchoPagina - this.margen, 30, {
      align: 'right',
    });
    doc.setTextColor(0);
  }
}