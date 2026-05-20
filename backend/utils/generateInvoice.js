const PDFDocument = require('pdfkit');

const generateInvoice = (order, stream) => {
  const doc = new PDFDocument({
    size: 'LETTER',
    margins: { top: 30, bottom: 10, left: 40, right: 40 }
  });

  // Pipe the doc to the write stream
  doc.pipe(stream);

  // 1. Accent Top Bar
  doc.rect(0, 0, 612, 10).fill('#0055A5');

  // 2. Header Section
  doc
    .fillColor('#0055A5')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('Vision Pro LCD', 50, 35)
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor('#64748b')
    .text('Premium LCD Refurbishing & Wholesale Parts', 50, 60)
    .moveDown();

  // Company details on the right
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text('Vision Pro LCD', 300, 35, { align: 'right', width: 262 })
    .text('7215 Goreway Dr #1c27', 300, 47, { align: 'right', width: 262 })
    .text('Mississauga, L4T2T9, Ontario', 300, 59, { align: 'right', width: 262 })
    .text('Visionpro.lcd@gmail.com | (647) 261-5077', 300, 71, { align: 'right', width: 262 });

  // Divider
  generateHr(doc, 90, '#cbd5e1', 1);

  // 3. Invoice Title & Details
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(20)
    .text('INVOICE', 50, 100);

  // Customer Information Columns
  const infoTop = 120;

  // Left Column - Invoice Meta
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#64748b')
    .text('INVOICE DETAILS', 50, infoTop)
    
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text('Order ID:', 50, infoTop + 15)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(order._id.toString(), 110, infoTop + 15)
    
    .font('Helvetica')
    .fillColor('#475569')
    .text('Date:', 50, infoTop + 28)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(new Date(order.createdAt).toLocaleDateString(), 110, infoTop + 28)
    
    .font('Helvetica')
    .fillColor('#475569')
    .text('Status:', 50, infoTop + 41);

  // Draw Badge for Payment Status
  const isPaid = !!order.isPaid;
  const statusText = isPaid ? 'PAID' : 'PAYMENT PENDING';
  const badgeColor = isPaid ? '#15803d' : '#b91c1c'; // green-700 / red-700
  const badgeBg = isPaid ? '#f0fdf4' : '#fef2f2';    // green-50 / red-50
  doc.roundedRect(110, infoTop + 39, 110, 14, 3).fill(badgeBg);
  doc
    .fillColor(badgeColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(statusText, 110, infoTop + 42, { width: 110, align: 'center' });

  // Right Column - Bill To
  const clientName = order.user?.companyName || order.user?.name || 'B2B Customer';
  const clientContactName = order.user?.companyName ? order.user?.name : '';

  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#64748b')
    .text('BILL & SHIP TO', 300, infoTop)
    
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor('#0f172a')
    .text(clientName, 300, infoTop + 15, { width: 262 });

  let billToY = infoTop + 28;
  if (clientContactName) {
    doc
      .font('Helvetica-Oblique')
      .fontSize(9)
      .fillColor('#475569')
      .text(`Attn: ${clientContactName}`, 300, billToY, { width: 262 });
    billToY += 13;
  }

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text(order.shippingAddress.address, 300, billToY, { width: 262 })
    .text(
      `${order.shippingAddress.city}, ${order.shippingAddress.postalCode}`,
      300,
      billToY + 13,
      { width: 262 }
    )
    .text(order.shippingAddress.country, 300, billToY + 26, { width: 262 });

  // Divider
  generateHr(doc, 195, '#cbd5e1', 1);

  // 4. Invoice Table
  let currentY = 210;

  // Header background
  doc.roundedRect(50, currentY, 512, 18, 4).fill('#f1f5f9');
  
  // Header text
  generateTableRow(doc, currentY + 4, 'Item Description', 'Unit Price', 'Qty', 'Amount', { isHeader: true });
  currentY += 22;

  // Loop through order items
  doc.font('Helvetica');
  for (let i = 0; i < order.orderItems.length; i++) {
    const item = order.orderItems[i];
    
    const rowHeight = generateTableRow(
      doc,
      currentY,
      item.name,
      `$${Number(item.price).toFixed(2)}`,
      item.qty,
      `$${(Number(item.price) * Number(item.qty)).toFixed(2)}`
    );

    // Draw bottom row divider
    generateHr(doc, currentY + rowHeight + 3, '#f1f5f9', 0.5);
    currentY += rowHeight + 8;
  }

  // 5. Totals Section
  currentY += 6;
  const totalsLeft = 320;
  
  // Subtotal
  doc.font('Helvetica').fontSize(9).fillColor('#475569');
  doc.text('Subtotal:', totalsLeft, currentY, { width: 130, align: 'right' });
  doc.font('Helvetica-Bold').fillColor('#0f172a');
  doc.text(`$${Number(order.itemsPrice || 0).toFixed(2)}`, 460, currentY, { width: 92, align: 'right' });
  currentY += 14;

  // Shipping
  doc.font('Helvetica').fillColor('#475569');
  doc.text('Shipping & Handling:', totalsLeft, currentY, { width: 130, align: 'right' });
  doc.font('Helvetica-Bold').fillColor('#0f172a');
  doc.text(`$${Number(order.shippingPrice || 0).toFixed(2)}`, 460, currentY, { width: 92, align: 'right' });
  currentY += 18;

  // Total box
  doc.roundedRect(totalsLeft + 30, currentY - 2, 212, 22, 4).fill('#eff6ff'); // blue-50 accent box
  
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#0055A5');
  doc.text('Total USD:', totalsLeft, currentY + 3, { width: 130, align: 'right' });
  doc.text(`$${Number(order.totalPrice || 0).toFixed(2)}`, 460, currentY + 3, { width: 92, align: 'right' });

  // 6. Footer Section
  generateFooter(doc);

  // End the document
  doc.end();
};

function generateTableRow(doc, y, item, unitCost, quantity, lineTotal, options = {}) {
  const { isHeader = false } = options;

  if (isHeader) {
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#1e293b');
  } else {
    doc.font('Helvetica').fontSize(9).fillColor('#334155');
  }

  // Draw columns cleanly aligned with margins
  const descHeight = isHeader ? 12 : doc.heightOfString(item, { width: 270 });
  
  doc.text(item, 60, y, { width: 270 });
  doc.text(unitCost, 330, y, { width: 70, align: 'right' });
  doc.text(quantity, 410, y, { width: 40, align: 'center' });
  doc.text(lineTotal, 460, y, { width: 92, align: 'right' });

  return Math.max(descHeight, 12);
}

function generateHr(doc, y, color = '#cbd5e1', width = 1) {
  doc
    .strokeColor(color)
    .lineWidth(width)
    .moveTo(50, y)
    .lineTo(562, y)
    .stroke();
}

function generateFooter(doc) {
  const footerTop = 715;
  
  // Clean thin top border for footer
  generateHr(doc, footerTop, '#e2e8f0', 0.5);

  doc
    .font('Helvetica-Oblique')
    .fontSize(8)
    .fillColor('#64748b')
    .text(
      'Thank you for partnering with Vision Pro LCD. All parts carry our lifetime warranty.',
      50,
      footerTop + 10,
      { align: 'center', width: 512 }
    )
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#94a3b8')
    .text(
      'Vision Pro LCD Refurbishing Portal | Mississauga, ON | Visionpro.lcd@gmail.com | (647) 261-5077',
      50,
      footerTop + 20,
      { align: 'center', width: 512 }
    );
}

module.exports = generateInvoice;
