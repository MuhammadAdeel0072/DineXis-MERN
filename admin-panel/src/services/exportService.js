import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Client-side PDF Export
 */
export const exportToPDF = ({ filename, title, subtitle, columns, data }) => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Premium Header Formatter
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(212, 175, 55); // #D4AF37 Gold
    doc.text("DineXis", pageWidth / 2, 25, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(102, 102, 102); // #666666
    doc.text(title.toUpperCase(), pageWidth / 2, 35, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(153, 153, 153); // #999999
    doc.text(`INTEL SOURCE: STAFF MANAGEMENT | GENERATED: ${new Date().toLocaleString()}`, pageWidth / 2, 42, { align: "center" });

    let startYPos = 48;
    if (subtitle && !subtitle.includes('Date:')) {
      doc.text(subtitle, pageWidth / 2, 47, { align: "center" });
      startYPos = 53;
    }

    // Premium Table Integration
    autoTable(doc, {
      startY: startYPos,
      head: [columns],
      body: data,
      theme: 'grid',
      styles: { 
        font: 'helvetica',
        fontSize: 9, 
        cellPadding: 5,
        textColor: [51, 51, 51], // #333333
        lineColor: [238, 238, 238], // #eeeeee
        lineWidth: 0.5,
      },
      headStyles: { 
        fillColor: [26, 29, 35], // #1A1D23 Charcoal
        textColor: [212, 175, 55], // Gold
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'left'
      },
      alternateRowStyles: { 
        fillColor: [249, 249, 249] // #f9f9f9
      },
      margin: { top: startYPos, left: 15, right: 15 },
      columnStyles: {
        0: { fontStyle: 'bold' } // Emphasize first column (usually Name)
      }
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("PDF Export failed:", error);
    if (window.toast) window.toast.error("Failed to generate PDF. Check console.");
    else alert("Failed to generate PDF: " + error.message);
  }
};

/**
 * Client-side Excel Export
 */
export const exportToExcel = ({ filename, sheetName, data }) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
