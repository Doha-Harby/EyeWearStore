import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/Misc.js';
import { cancelOrder } from './order.service.js';
import { ApiError } from '../utils/ApiError.js';

/** The only legal order lifecycle. Anything else (e.g. delivered -> pending) is rejected. */
export const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['delivered'],
  delivered: ['refunded'],
  cancelled: [],
  refunded: [],
};
export const canTransition = (from, to) => TRANSITIONS[from]?.includes(to) ?? false;

/** Days with no sales are missing from the aggregation, so we fill them with zeros for a continuous chart. */
export function fillDays(rows, days, now = new Date()) {
  const byDate = new Map(rows.map((r) => [r._id, r]));
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - (days - 1 - i));
    const date = d.toISOString().slice(0, 10);
    return { date, revenue: byDate.get(date)?.revenue ?? 0, orders: byDate.get(date)?.orders ?? 0 };
  });
}

export async function dashboard() {
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - 13);
  since.setUTCHours(0, 0, 0, 0);
  const live = { status: { $nin: ['cancelled', 'refunded'] } }; // cancelled/refunded orders are not revenue
  const [rev, orders, customers, products, pending, lowStock, byDay, recent, best] =
    await Promise.all([
      Order.aggregate([{ $match: live }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments({ deletedAt: null }),
      Order.countDocuments({ status: 'pending' }),
      Product.countDocuments({ deletedAt: null, stock: { $lt: 5 } }),
      Order.aggregate([
        { $match: { ...live, createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name').lean(),
      Product.find({ deletedAt: null })
        .sort({ sold: -1 })
        .limit(5)
        .select('name sold price')
        .lean(),
    ]);
  return {
    stats: { revenue: rev[0]?.total ?? 0, orders, customers, products, pending, lowStock },
    revenueByDay: fillDays(byDay, 14),
    recentOrders: recent,
    bestSellers: best,
  };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export async function listOrders({ status, q, page, limit }) {
  const filter = {
    ...(status && { status }),
    ...(q && { orderNumber: new RegExp(`^${escapeRe(q)}`, 'i') }),
  };
  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function updateOrderStatus(admin, id, status) {
  const order = await Order.findById(id);
  if (!order) throw ApiError.notFound('Order not found');
  const from = order.status;
  if (!canTransition(from, status))
    throw ApiError.conflict(`An order cannot move from ${from} to ${status}`);
  if (status === 'cancelled') {
    await cancelOrder(admin, id); // same transaction that returns the stock
  } else {
    order.status = status;
    if (status === 'delivered' && order.paymentMethod === 'cod') order.paymentStatus = 'paid'; // cash collected on delivery
    if (status === 'refunded') order.paymentStatus = 'refunded';
    await order.save();
  }
  await AuditLog.create({
    admin: admin._id,
    action: 'order.status',
    target: String(id),
    meta: { from, to: status },
  });
  return Order.findById(id).populate('user', 'name email').lean();
}
export { ORDER_STATUSES };
