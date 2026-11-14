import PDFDocument from 'pdfkit';

const money = (n) => `$${Number(n).toFixed(2)}`;

/** Streams a one-page PDF invoice to `out` (an HTTP response or any writable stream). */
export function streamInvoice(order, customer, out) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(out);
  doc.fontSize(24).text('LUMIÈRE', { characterSpacing: 4 });
  doc.fontSize(10).fillColor('#66635E').text('Premium eyewear').moveDown(1.5);
  doc.fillColor('#242424').fontSize(16).text(`Invoice ${order.orderNumber}`);
  doc
    .fontSize(10)
    .fillColor('#66635E')
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-GB')}`)
    .moveDown();
  const a = order.shippingAddress || {};
  doc
    .fillColor('#242424')
    .text(`Billed to: ${customer?.name ?? a.fullName ?? ''}`)
    .text(customer?.email ?? '')
    .text([a.line1, a.city, a.postalCode, a.country].filter(Boolean).join(', '))
    .moveDown();

  const row = (y, cols, bold) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(10);
    doc
      .text(cols[0], 50, y, { width: 270 })
      .text(cols[1], 330, y, { width: 40 })
      .text(cols[2], 380, y, { width: 80, align: 'right' })
      .text(cols[3], 470, y, { width: 80, align: 'right' });
  };
  let y = doc.y + 10;
  row(y, ['Item', 'Qty', 'Price', 'Total'], true);
  y += 20;
  for (const i of order.items) {
    row(y, [
      `${i.name}${i.color ? ` (${i.color})` : ''}`,
      String(i.qty),
      money(i.price),
      money(i.price * i.qty),
    ]);
    y += 20;
  }
  y += 10;
  for (const [label, value, bold] of [
    ['Subtotal', order.subtotal],
    ['Discount', -order.discount],
    ['Shipping', order.shippingCost],
    ['Total', order.total, true],
  ]) {
    doc
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      .text(label, 380, y, { width: 80, align: 'right' })
      .text(money(value), 470, y, { width: 80, align: 'right' });
    y += 18;
  }
  doc
    .font('Helvetica')
    .fillColor('#66635E')
    .text(
      `Payment: ${order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card'} (${order.paymentStatus})`,
      50,
      y + 20,
    );
  doc.end();
}
