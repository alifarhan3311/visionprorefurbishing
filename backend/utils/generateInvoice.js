const PDFDocument = require('pdfkit');

const generateInvoice = (order, stream) => {
  const doc = new PDFDocument({ margin: 50, size: 'LETTER' });

  // Pipe the doc to the write stream
  doc.pipe(stream);

  // 1. Accent Top Bar
  doc.rect(0, 0, 612, 15).fill('#0055A5');

  // 2. Header Section
  doc
    .fillColor('#0055A5')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('MobileSentrix B2B', 50, 45)
    .font('Helvetica-Oblique')
    .fontSize(9)
    .fillColor('#64748b')
    .text('Premium LCD Refurbishing & Wholesale Parts', 50, 72)
    .moveDown();

  // Company details on the right
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text('MobileSentrix Canada Ltd.', 300, 45, { align: 'right', width: 262 })
    .text('123 B2B Industrial Pkwy, Suite 100', 300, 58, { align: 'right', width: 262 })
    .text('Toronto, ON M5V 2T6', 300, 71, { align: 'right', width: 262 })
    .text('support@mobilesentrix.ca | +1 (800) 555-0199', 300, 84, { align: 'right', width: 262 });

  // Divider
  generateHr(doc, 110, '#cbd5e1', 1);

  // 3. Invoice Title & Details
  doc
    .fillColor('#0f172a')
    .font('Helvetica-Bold')
    .fontSize(24)
    .text('INVOICE', 50, 130);

  // Customer Information Columns
  const infoTop = 175;

  // Left Column - Invoice Meta
  doc
    .font('Helvetica-Bold')
    .fontSize(9)
    .fillColor('#64748b')
    .text('INVOICE DETAILS', 50, infoTop)
    
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#475569')
    .text('Order ID:', 50, infoTop + 18)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(order._id.toString(), 110, infoTop + 18)
    
    .font('Helvetica')
    .fillColor('#475569')
    .text('Date:', 50, infoTop + 33)
    .font('Helvetica-Bold')
    .fillColor('#0f172a')
    .text(new Date(order.createdAt).toLocaleDateString(), 110, infoTop + 33)
    
    .font('Helvetica')
    .fillColor('#475569')
    .text('Status:', 50, infoTop + 48);

  // Draw Badge for Payment Status
  const isPaid = !!order.isPaid;
  const statusText = isPaid ? 'PAID' : 'PAYMENT PENDING';
  const badgeColor = isPaid ? '#15803d' : '#b91c1c'; // green-700 / red-700
  const badgeBg = isPaid ? '#f0fdf4' : '#fef2f2';    // green-50 / red-50
  doc.roundedRect(110, infoTop + 46, 110, 14, 3).fill(badgeBg);
  doc
    .fillColor(badgeColor)
    .font('Helvetica-Bold')
    .fontSize(8)
    .text(statusText, 110, infoTop + 49, { width: 110, align: 'center' });

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
    .text(clientName, 300, infoTop + 18, { width: 262 });

  let billToY = infoTop + 32;
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
  generateHr(doc, 265, '#cbd5e1', 1);

  // 4. Invoice Table
  let currentY = 285;

  // Header background
  doc.roundedRect(50, currentY, 512, 22, 4).fill('#f1f5f9');
  
  // Header text
  generateTableRow(doc, currentY + 6, 'Item Description', 'Unit Price', 'Qty', 'Amount', { isHeader: true });
  currentY += 28;

  // Loop through order items
  doc.font('Helvetica');
  for (let i = 0; i < order.orderItems.length; i++) {
    const item = order.orderItems[i];
    
    // Check if we are running out of space on the page (Letter height is 792, leave room for totals and footer)
    if (currentY > 620) {
      doc.addPage();
      // Add top accent bar on new page
      doc.rect(0, 0, 612, 15).fill('#0055A5');
      currentY = 40;
    }

    const rowHeight = generateTableRow(
      doc,
      currentY,
      item.name,
      `$${Number(item.price).toFixed(2)}`,
      item.qty,
      `$${(Number(item.price) * Number(item.qty)).toFixed(2)}`
    );

    // Draw bottom row divider
    generateHr(doc, currentY + rowHeight + 5, '#f1f5f9', 0.5);
    currentY += rowHeight + 12;
  }

  // Check page height for totals
  if (currentY > 600) {
    doc.addPage();
    doc.rect(0, 0, 612, 15).fill('#0055A5');
    currentY = 40;
  }

  // 5. Totals Section
  currentY += 10;
  const totalsLeft = 320;
  
  // Subtotal
  doc.font('Helvetica').fontSize(9).fillColor('#475569');
  doc.text('Subtotal:', totalsLeft, currentY, { width: 130, align: 'right' });
  doc.font('Helvetica-Bold').fillColor('#0f172a');
  doc.text(`$${Number(order.itemsPrice || 0).toFixed(2)}`, 460, currentY, { width: 92, align: 'right' });
  currentY += 18;

  // Shipping
  doc.font('Helvetica').fillColor('#475569');
  doc.text('Shipping & Handling:', totalsLeft, currentY, { width: 130, align: 'right' });
  doc.font('Helvetica-Bold').fillColor('#0f172a');
  doc.text(`$${Number(order.shippingPrice || 0).toFixed(2)}`, 460, currentY, { width: 92, align: 'right' });
  currentY += 22;

  // Total box
  doc.roundedRect(totalsLeft + 30, currentY - 4, 212, 26, 4).fill('#eff6ff'); // blue-50 accent box
  
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
  const footerTop = 720;
  
  // Clean thin top border for footer
  generateHr(doc, footerTop, '#e2e8f0', 0.5);

  doc
    .font('Helvetica-Oblique')
    .fontSize(8)
    .fillColor('#64748b')
    .text(
      'Thank you for partnering with MobileSentrix B2B. All parts carry our lifetime warranty.',
      50,
      footerTop + 12,
      { align: 'center', width: 512 }
    )
    .font('Helvetica')
    .fontSize(7)
    .fillColor('#94a3b8')
    .text(
      'Vision Pro LCD Refurbishing Portal | Toronto, Canada | support@mobilesentrix.ca',
      50,
      footerTop + 24,
      { align: 'center', width: 512 }
    );
}

module.exports = generateInvoice;
