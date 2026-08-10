import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { CitasPorProfesional } from '../models/reporte.model';

@Injectable({
  providedIn: 'root',
})
export class PdfReporteService {
  private readonly margen = 40;

  /**
   * Genera y descarga el PDF del reporte de citas completadas por
   * profesional, a partir de datos reales obtenidos del API.
   */
  exportarCitasPorProfesional(
    datos: CitasPorProfesional[],
    generadoPor: string
  ): void {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const anchoPagina = doc.internal.pageSize.getWidth();

    const fechaGeneracion = new Date().toLocaleString('es-CR', {
      dateStyle: 'long',
      timeStyle: 'short',
    });

    // ---------- ENCABEZADO ----------
    this.dibujarEncabezado(doc, anchoPagina);

    // ---------- TÍTULO Y FECHA ----------
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Reporte de Citas por Profesional', this.margen, 65);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(90);
    doc.text(`Fecha de generación: ${fechaGeneracion}`, this.margen, 82);
    doc.setTextColor(0);

    // ---------- TABLA DE DATOS ----------
    const totalCitas = datos.reduce(
      (acumulado, fila) => acumulado + fila.citasCompletadas,
      0
    );

    autoTable(doc, {
      startY: 100,
      margin: { left: this.margen, right: this.margen },
      head: [['Profesional', 'Título profesional', 'Citas completadas']],
      body: datos.map((fila) => [
        fila.profesional,
        fila.tituloProfesional,
        fila.citasCompletadas.toString(),
      ]),
      headStyles: {
        fillColor: [21, 101, 192],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: { 2: { halign: 'center' } },
      didDrawPage: () => {
        // Repite el encabezado si el reporte ocupa varias páginas
        if (doc.getNumberOfPages() > 1) {
          this.dibujarEncabezado(doc, anchoPagina);
        }
      },
    });

    // ---------- TOTAL ----------
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } })
      .lastAutoTable.finalY;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de citas completadas: ${totalCitas}`, this.margen, finalY + 24);

    // ---------- PIE DE PÁGINA / NUMERACIÓN ----------
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

    doc.save('reporte-citas-por-profesional.pdf');
  }

  private dibujarEncabezado(doc: jsPDF, anchoPagina: number): void {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);
    doc.text('Naturale - Beauty Marketplace', this.margen, 30);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text('Reporte de Citas por Profesional', anchoPagina - this.margen, 30, {
      align: 'right',
    });
    doc.setTextColor(0);
  }
}