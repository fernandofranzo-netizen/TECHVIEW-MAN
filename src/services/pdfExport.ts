import { jsPDF } from 'jspdf';
import { TechnicalDocument } from '../types';

export async function exportDocumentToPDF(
  doc: TechnicalDocument,
  options: {
    format?: 'a4' | 'a3';
    orientation?: 'landscape' | 'portrait';
    includeCarimbo?: boolean;
    includeNotes?: boolean;
    theme?: 'white' | 'dark' | 'blueprint';
  } = {}
): Promise<void> {
  const {
    format = 'a4',
    orientation = 'landscape',
    includeCarimbo = true,
    includeNotes = true,
  } = options;

  // Create jsPDF instance
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  // 1. Draw outer drawing frame (borda técnica com margem padrão ABNT)
  pdf.setLineWidth(0.6);
  pdf.setDrawColor(40, 40, 40);
  pdf.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

  // Inner margin line
  pdf.setLineWidth(0.2);
  pdf.rect(margin + 2, margin + 2, pageWidth - (margin + 2) * 2, pageHeight - (margin + 2) * 2);

  // 2. Header Bar
  const headerY = margin + 4;
  pdf.setFillColor(245, 247, 250);
  pdf.rect(margin + 2, headerY, pageWidth - (margin + 2) * 2, 16, 'F');
  pdf.line(margin + 2, headerY + 16, pageWidth - (margin + 2), headerY + 16);

  // Header texts
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(13);
  pdf.setTextColor(20, 30, 50);
  pdf.text('SISTEMA DE CONSULTA TÉCNICA E ENGENHARIA', margin + 6, headerY + 6);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(80, 90, 100);
  pdf.text(`DISCIPLINA: ${doc.discipline.toUpperCase()} | CATEGORIA: ${doc.category.toUpperCase()}`, margin + 6, headerY + 12);

  // Document status badge in header
  const statusX = pageWidth - margin - 50;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  if (doc.status === 'Aprovado') {
    pdf.setFillColor(220, 252, 231);
    pdf.setTextColor(22, 101, 52);
  } else if (doc.status === 'Para Execução') {
    pdf.setFillColor(219, 234, 254);
    pdf.setTextColor(30, 64, 175);
  } else {
    pdf.setFillColor(254, 243, 199);
    pdf.setTextColor(146, 64, 14);
  }
  pdf.rect(statusX - 2, headerY + 3, 46, 10, 'F');
  pdf.setDrawColor(180, 190, 200);
  pdf.rect(statusX - 2, headerY + 3, 46, 10, 'S');
  pdf.text(doc.status.toUpperCase(), statusX + 23, headerY + 9.5, { align: 'center' });

  // 3. Render the Visual Technical Drawing / Photo
  const contentY = headerY + 18;
  const contentHeight = pageHeight - margin - 48; // Leaves room for carimbo at bottom
  const contentWidth = pageWidth - (margin + 2) * 2;

  try {
    const dataUrl = await getDocumentImageDataUrl(doc);
    if (dataUrl) {
      // Calculate aspect ratio fit
      const imgProps = pdf.getImageProperties(dataUrl);
      const imgRatio = imgProps.width / imgProps.height;
      const boxRatio = contentWidth / contentHeight;

      let drawWidth = contentWidth;
      let drawHeight = contentHeight;
      let drawX = margin + 2;
      let drawY = contentY;

      if (imgRatio > boxRatio) {
        drawHeight = contentWidth / imgRatio;
        drawY = contentY + (contentHeight - drawHeight) / 2;
      } else {
        drawWidth = contentHeight * imgRatio;
        drawX = margin + 2 + (contentWidth - drawWidth) / 2;
      }

      pdf.addImage(dataUrl, 'PNG', drawX, drawY, drawWidth, drawHeight, undefined, 'FAST');
    }
  } catch (err) {
    console.error('Erro ao renderizar imagem para PDF:', err);
    pdf.setFontSize(11);
    pdf.setTextColor(150, 50, 50);
    pdf.text('Visualização gráfica incorporada.', margin + 10, contentY + 20);
  }

  // 4. Carimbo Técnico / Title Block (Bottom Right corner or spanning bottom)
  if (includeCarimbo) {
    const carimboHeight = 28;
    const carimboWidth = 140;
    const carimboX = pageWidth - margin - 2 - carimboWidth;
    const carimboY = pageHeight - margin - 2 - carimboHeight;

    // Carimbo Box
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(30, 40, 50);
    pdf.setLineWidth(0.4);
    pdf.rect(carimboX, carimboY, carimboWidth, carimboHeight, 'FD');

    // Dividers
    pdf.line(carimboX, carimboY + 9, carimboX + carimboWidth, carimboY + 9);
    pdf.line(carimboX, carimboY + 18, carimboX + carimboWidth, carimboY + 18);
    pdf.line(carimboX + 85, carimboY + 9, carimboX + 85, carimboY + carimboHeight);
    pdf.line(carimboX + 115, carimboY + 9, carimboX + 115, carimboY + carimboHeight);

    // Title Block contents
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(10, 20, 40);
    pdf.text(doc.title.toUpperCase(), carimboX + 4, carimboY + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text('CÓDIGO DA PRANCHA / DOC:', carimboX + 4, carimboY + 12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8.5);
    pdf.setTextColor(10, 20, 40);
    pdf.text(doc.code, carimboX + 4, carimboY + 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text('EQUIPAMENTO:', carimboX + 4, carimboY + 21);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(10, 20, 40);
    pdf.text(doc.equipmentCode, carimboX + 4, carimboY + 25);

    // Col 2: Escala e Data
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text('ESCALA:', carimboX + 88, carimboY + 12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(10, 20, 40);
    pdf.text(doc.scale, carimboX + 88, carimboY + 16);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text('DATA:', carimboX + 88, carimboY + 21);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(10, 20, 40);
    pdf.text(doc.date, carimboX + 88, carimboY + 25);

    // Col 3: Revisão
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(80, 80, 80);
    pdf.text('REVISÃO:', carimboX + 118, carimboY + 12);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(180, 20, 20);
    pdf.text(doc.revision, carimboX + 118, carimboY + 16.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(90, 90, 90);
    pdf.text('AUTOR: ' + doc.author.split(' ')[0], carimboX + 118, carimboY + 21);
    pdf.text('APROV: ' + doc.approver.split(' ')[0], carimboX + 118, carimboY + 25);

    // Left info block (Especificações rápidas / Notas de engenharia)
    const infoX = margin + 4;
    const infoY = pageHeight - margin - 2 - carimboHeight;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.setTextColor(40, 50, 60);
    pdf.text('NOTAS E ESPECIFICAÇÕES TÉCNICAS:', infoX, infoY + 5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(70, 70, 70);

    const specEntries = Object.entries(doc.specs).slice(0, 3);
    let lineOffsetY = 9;
    specEntries.forEach(([key, val]) => {
      pdf.text(`• ${key}: ${val}`, infoX, infoY + lineOffsetY);
      lineOffsetY += 4;
    });

    if (doc.notes && doc.notes[0]) {
      pdf.text(`• Nota Geral: ${doc.notes[0]}`, infoX, infoY + lineOffsetY);
    }
  }

  // 5. Page 2 (Technical Datasheet & Annotations details if requested)
  if (includeNotes && (doc.annotations.length > 0 || Object.keys(doc.specs).length > 3 || doc.notes.length > 1)) {
    pdf.addPage(format, orientation);

    // Borda da Página 2
    pdf.setLineWidth(0.6);
    pdf.setDrawColor(40, 40, 40);
    pdf.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);

    // Header da Página 2
    pdf.setFillColor(245, 247, 250);
    pdf.rect(margin + 2, margin + 4, pageWidth - (margin + 2) * 2, 14, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(20, 30, 50);
    pdf.text(`ANEXO TÉCNICO & REGISTRO DE INSPEÇÃO - ${doc.code}`, margin + 6, margin + 12);

    let secY = margin + 26;

    // Technical specs table
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(30, 40, 60);
    pdf.text('PARÂMETROS E ESPECIFICAÇÕES DO COMPONENTE', margin + 6, secY);
    secY += 6;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    Object.entries(doc.specs).forEach(([k, v]) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(k + ':', margin + 10, secY);
      pdf.setFont('helvetica', 'normal');
      pdf.text(v, margin + 70, secY);
      pdf.setDrawColor(230, 230, 230);
      pdf.line(margin + 6, secY + 2, pageWidth - margin - 6, secY + 2);
      secY += 7;
    });

    secY += 6;

    // General Notes
    if (doc.notes && doc.notes.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 40, 60);
      pdf.text('NOTAS GERAIS DE PROJETO E NORMAS APLICÁVEIS', margin + 6, secY);
      secY += 6;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      doc.notes.forEach((note, idx) => {
        pdf.text(`${idx + 1}. ${note}`, margin + 10, secY);
        secY += 6;
      });
    }

    secY += 6;

    // User Annotations / Campo
    if (doc.annotations.length > 0) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 40, 60);
      pdf.text(`ANOTAÇÕES E APONTAMENTOS DE CAMPO (${doc.annotations.length})`, margin + 6, secY);
      secY += 6;

      doc.annotations.forEach((anno, i) => {
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8);
        pdf.setTextColor(180, 40, 40);
        pdf.text(`[Ponto #${i + 1}] ${anno.title}`, margin + 10, secY);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        pdf.text(`Autor: ${anno.author} em ${anno.date}`, margin + 80, secY);
        secY += 5;
        pdf.text(anno.text, margin + 14, secY);
        secY += 8;
      });
    }
  }

  // Save the PDF
  const safeFilename = `${doc.code.replace(/[^a-zA-Z0-9_-]/g, '_')}_${doc.revision}.pdf`;
  pdf.save(safeFilename);
}

// Helper to convert SVG or Image to base64 DataURL for jsPDF
async function getDocumentImageDataUrl(doc: TechnicalDocument): Promise<string> {
  if (doc.imageUrl) {
    return doc.imageUrl;
  }

  if (doc.svgContent) {
    return new Promise((resolve) => {
      const img = new Image();
      const svgBlob = new Blob([doc.svgContent!], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = 2; // High resolution rendering
        canvas.width = (img.width || 1200) * scale;
        canvas.height = (img.height || 800) * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png', 0.95);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          resolve('');
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve('');
      };
      img.src = url;
    });
  }

  return '';
}
