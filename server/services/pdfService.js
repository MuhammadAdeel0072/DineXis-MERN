const PDFDocument = require('pdfkit');

const generateReceipt = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  // Add Header
  doc
    .fillColor('#D4AF37')
    .fontSize(25)
    .text('AK-7 REST', 50, 45, { align: 'center' })
    .fillColor('#444444')
    .fontSize(10)
    .text('Gourmet Dining Experience', 200, 65, { align: 'center' })
    .moveDown();

  // Add Order Info
  doc
    .fontSize(12)
    .text(`Order Number: ${order.orderNumber}`, 50, 100)
    .text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 50, 115)
    .text(`Customer: ${order.user.firstName} ${order.user.lastName}`, 50, 130)
    .moveDown();

  // Table Header
  const tableTop = 160;
  doc
    .fontSize(10)
    .text('Item', 50, tableTop)
    .text('Quantity', 250, tableTop)
    .text('Price', 350, tableTop)
    .text('Total', 450, tableTop);

  // Items
  let position = tableTop + 20;
  order.orderItems.forEach(item => {
    doc
      .text(item.name, 50, position)
      .text(item.qty.toString(), 250, position)
      .text(`$${item.price.toFixed(2)}`, 350, position)
      .text(`$${(item.qty * item.price).toFixed(2)}`, 450, position);
    position += 15;
  });

  // Footer
  doc
    .fontSize(12)
    .text('------------------------------------------------', 350, position + 20)
    .text(`Total Price: $${order.totalPrice.toFixed(2)}`, 350, position + 35, { bold: true })
    .fillColor('#D4AF37')
    .text('Thank you for choosing AK-7 REST!', 50, position + 60, { align: 'center' });

  doc.pipe(stream);
  doc.end();
};

module.exports = { generateReceipt };
