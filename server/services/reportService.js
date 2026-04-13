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

    // Simple Table Implementation
    const startX = 30;
    let currentY = doc.y;
    const colWidth = (doc.page.width - 60) / headers.length;

    // Table Headers
    doc.rect(startX, currentY, doc.page.width - 60, 20).fill('#1a1d23');
    doc.fillColor('#D4AF37').fontSize(10);
    headers.forEach((h, i) => {
        doc.text(h, startX + i * colWidth + 5, currentY + 5, { width: colWidth - 10 });
    });

    currentY += 20;
    doc.fillColor('#333');

    // Rows
    rows.forEach((row, rowIndex) => {
        if (currentY > doc.page.height - 50) {
            doc.addPage();
            currentY = 30;
        }

        // Zebra striping
        if (rowIndex % 2 === 0) {
            doc.rect(startX, currentY, doc.page.width - 60, 20).fill('#f9f9f9');
        }

        doc.fillColor('#333');
        headers.forEach((h, i) => {
            const val = row[i] !== undefined ? String(row[i]) : '';
            doc.text(val, startX + i * colWidth + 5, currentY + 5, { width: colWidth - 10 });
        });
        currentY += 20;
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
