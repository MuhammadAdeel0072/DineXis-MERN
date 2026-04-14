const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Generate PDF Report Table
 * @param {Object} res - Express response
 * @param {String} title - Report Title
 * @param {Array} headers - Table headers
 * @param {Array} rows - Table rows
 */
const generatePDFReport = (res, title, headers, rows) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}.pdf`);
    
    doc.pipe(res);

    // Title
    doc.fillColor('#D4AF37').fontSize(20).text(title, { align: 'center' });
    doc.fontSize(10).fillColor('#666').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table Implementation
    const startX = 30;
    const tableWidth = doc.page.width - 60;
    
    // Column scaling priorities (more space for names/descriptions)
    const weights = headers.map(h => {
        const lower = h.toLowerCase();
        if (lower.includes('customer') || lower.includes('name') || lower.includes('item') || lower.includes('description') || lower.includes('activity')) return 2.5;
        if (lower.includes('order') || lower.includes('date') || lower.includes('amount') || lower.includes('value') || lower.includes('total') || lower.includes('status') || lower.includes('method') || lower.includes('role')) return 1.2;
        return 1.5;
    });
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const colWidths = weights.map(w => (w / totalWeight) * tableWidth);

    // Table Headers
    let currentY = doc.y;
    doc.rect(startX, currentY, tableWidth, 25).fill('#1a1d23');
    doc.fillColor('#D4AF37').fontSize(10).font('Helvetica-Bold');
    
    let currentX = startX;
    headers.forEach((h, i) => {
        doc.text(h, currentX + 8, currentY + 8, { width: colWidths[i] - 16, align: 'left' });
        currentX += colWidths[i];
    });

    currentY += 25;
    doc.font('Helvetica').fontSize(9);

    // Rows
    rows.forEach((row, rowIndex) => {
        // Calculate dynamic row height based on cell content wrapping
        let maxHeight = 10; // Minimum row padding
        row.forEach((cell, i) => {
            const textHeight = doc.heightOfString(String(cell || ''), { width: colWidths[i] - 16 });
            if (textHeight > maxHeight) maxHeight = textHeight;
        });
        
        const rowHeight = maxHeight + 14; // Content + Padding

        // Page break handling
        if (currentY + rowHeight > doc.page.height - 50) {
            doc.addPage();
            currentY = 30;
            
            // Re-draw headers on new page? (Optional, but let's keep it simple for now)
            // For now just continue with rows
        }

        // Zebra striping
        if (rowIndex % 2 === 1) {
            doc.rect(startX, currentY, tableWidth, rowHeight).fill('#f9f9f9');
        }

        doc.fillColor('#333');
        currentX = startX;
        row.forEach((cell, i) => {
            const val = cell !== undefined ? String(cell) : '';
            doc.text(val, currentX + 8, currentY + 7, { width: colWidths[i] - 16, align: 'left' });
            currentX += colWidths[i];
        });
        
        currentY += rowHeight;

        // Border line for better separation
        doc.moveTo(startX, currentY).lineTo(startX + tableWidth, currentY).strokeColor('#eeeeee').lineWidth(0.5).stroke();
    });

    doc.end();
};

/**
 * Generate Excel Report
 * @param {Object} res - Express response
 * @param {String} title - Sheet Title
 * @param {Array} headers - Column headers
 * @param {Array} rows - Data rows
 */
const generateExcelReport = async (res, title, headers, rows) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(title);

    worksheet.columns = headers.map(h => ({ header: h, key: h.toLowerCase().replace(/ /g, '_'), width: 20 }));

    rows.forEach(row => {
        const rowData = {};
        headers.forEach((h, i) => {
            rowData[h.toLowerCase().replace(/ /g, '_')] = row[i];
        });
        worksheet.addRow(rowData);
    });

    // Formatting
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1D23' } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${title.toLowerCase().replace(/ /g, '_')}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    generatePDFReport,
    generateExcelReport
};
