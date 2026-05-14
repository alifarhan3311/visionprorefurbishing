const PDFDocument = require('pdfkit');

const generateInvoice = (order, stream) => {
  const doc = new PDFDocument({ margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, order);
  generateInvoiceTable(doc, order);
  generateFooter(doc);

  doc.pipe(stream);
  doc.end();
};

function generateHeader(doc) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('MobileSentrix B2B', 50, 57)
    .fontSize(10)
    .text('123 B2B Street, Suite 100', 200, 65, { align: 'right' })
    .text('Dallas, TX 75201', 200, 80, { align: 'right' })
    .moveDown();
}

function generateCustomerInformation(doc, order) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Invoice', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Order ID:', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(order._id.toString(), 150, customerInformationTop)
    .font('Helvetica')
    .text('Date:', 50, customerInformationTop + 15)
    .text(new Date(order.createdAt).toLocaleDateString(), 150, customerInformationTop + 15)
    .text('Total Amount:', 50, customerInformationTop + 30)
    .text(`$${order.totalPrice.toFixed(2)}`, 150, customerInformationTop + 30)

    .font('Helvetica-Bold')
    .text(order.user.companyName || order.user.name || 'B2B Customer', 300, customerInformationTop)
    .font('Helvetica')
    .text(order.shippingAddress.address, 300, customerInformationTop + 15)
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, order) {
  let i;
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Item',
    'Description',
    'Unit Cost',
    'Quantity',
    'Line Total'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  for (i = 0; i < order.orderItems.length; i++) {
    const item = order.orderItems[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.name.substring(0, 15),
      item.name,
      `$${item.price.toFixed(2)}`,
      item.qty,
      `$${(item.price * item.qty).toFixed(2)}`
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Subtotal',
    '',
    `$${order.itemsPrice.toFixed(2)}`
  );

  const shippingPosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    shippingPosition,
    '',
    '',
    'Shipping',
    '',
    `$${order.shippingPrice.toFixed(2)}`
  );

  const totalPosition = shippingPosition + 25;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    totalPosition,
    '',
    '',
    'Total',
    '',
    `$${order.totalPrice.toFixed(2)}`
  );
  doc.font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Thank you for your business. For support, please contact help@mobilesentrix.com',
      50,
      780,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(doc, y, item, description, unitCost, quantity, lineTotal) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y, { width: 200 })
    .text(unitCost, 350, y, { width: 90, align: 'right' })
    .text(quantity, 440, y, { width: 40, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

module.exports = generateInvoice;
