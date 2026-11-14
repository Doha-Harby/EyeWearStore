import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import { sendMail } from '../utils/mailer.js';

const money = (n) => `$${n.toFixed(2)}`;

/** Called after an order is saved. Failures are logged by the caller and never break checkout. */
export async function orderPlaced(order) {
  const user = await User.findById(order.user);
  const lines = order.items
    .map((i) => `${i.qty} x ${i.name}${i.color ? ` (${i.color})` : ''}  ${money(i.price * i.qty)}`)
    .join('\n');
  await sendMail({
    to: user.email,
    subject: `LUMIÈRE order ${order.orderNumber}`,
    text: `Hi ${user.name},\n\nThank you for your order.\n\n${lines}\n\nTotal: ${money(order.total)}\nPayment: ${order.paymentMethod === 'cod' ? 'Cash on delivery' : 'Card (complete payment within 30 minutes)'}\n`,
  });
  if (env.ADMIN_EMAIL) {
    const low = await Product.find({
      _id: { $in: order.items.map((i) => i.product) },
      stock: { $lt: 5 },
    })
      .select('name stock')
      .lean();
    if (low.length)
      await sendMail({
        to: env.ADMIN_EMAIL,
        subject: 'LUMIÈRE: low stock',
        text: low.map((p) => `${p.name}: ${p.stock} left`).join('\n'),
      });
  }
}
