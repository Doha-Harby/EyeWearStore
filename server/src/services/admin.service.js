import { refundOrder } from './payment.service.js';
import { Coupon, Review, RefreshToken } from '../models/Misc.js';
import { refreshRating } from './review.service.js';
import { Order, ORDER_STATUSES } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { AuditLog, InventoryTransaction } from '../models/Misc.js';
import { cancelOrder } from './order.service.js';
import { slugify } from '../utils/slug.js';
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
  const paidByCard = order.paymentMethod === 'stripe' && order.paymentStatus === 'paid';
  // Refund FIRST: if Stripe fails, the order is left untouched instead of cancelled-but-not-refunded.
  if (paidByCard && ['cancelled', 'refunded'].includes(status)) await refundOrder(order);
  if (status === 'cancelled') {
    await cancelOrder(admin, id); // same transaction that returns the stock
    if (paidByCard) await Order.updateOne({ _id: id }, { paymentStatus: 'refunded' });
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

// ---------- product management ----------
const audit = (admin, action, target, meta) =>
  AuditLog.create({ admin: admin._id, action, target: String(target), meta });

export async function listAdminProducts({ q, deleted, page, limit }) {
  const filter = { deletedAt: deleted === 'true' ? { $ne: null } : null };
  if (q)
    filter.$or = [
      { name: new RegExp(escapeRe(q), 'i') },
      { sku: new RegExp(`^${escapeRe(q)}`, 'i') },
    ];
  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('brand', 'name')
      .populate('category', 'name')
      .lean(),
    Product.countDocuments(filter),
  ]);
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function createProduct(admin, data) {
  let slug = slugify(data.name);
  if (await Product.exists({ slug })) slug += `-${Date.now().toString(36).slice(-4)}`; // keep slugs unique
  const product = await Product.create({ ...data, slug });
  if (product.stock > 0)
    await InventoryTransaction.create({
      product: product._id,
      delta: product.stock,
      reason: 'restock',
      admin: admin._id,
      note: 'Initial stock',
    });
  await audit(admin, 'product.create', product._id, { name: product.name });
  return product;
}

export async function updateProduct(admin, id, data) {
  const product = await Product.findOne({ _id: id, deletedAt: null });
  if (!product) throw ApiError.notFound('Product not found');
  // Load + save (instead of a raw update) so the Mongoose validators run, e.g. discount < price.
  product.set(data);
  product.discountPrice = data.discountPrice; // undefined clears an old discount
  product.frameShape = data.frameShape;
  await product.save();
  await audit(admin, 'product.update', id, { name: product.name });
  return product;
}

export async function setDeleted(admin, id, deleted) {
  const product = await Product.findOneAndUpdate(
    { _id: id, deletedAt: deleted ? null : { $ne: null } },
    { deletedAt: deleted ? new Date() : null },
    { new: true },
  );
  if (!product) throw ApiError.notFound('Product not found');
  await audit(admin, deleted ? 'product.delete' : 'product.restore', id, { name: product.name });
  return product;
}

/** Stock is only ever changed through this function (or orders), so the history in InventoryTransaction always adds up. */
export async function adjustStock(admin, id, { delta, note }) {
  const res = await Product.updateOne(
    { _id: id, deletedAt: null, stock: { $gte: delta < 0 ? -delta : 0 } },
    { $inc: { stock: delta } },
  );
  if (!res.modifiedCount) throw ApiError.conflict('Stock cannot go below zero');
  await InventoryTransaction.create({
    product: id,
    delta,
    reason: delta > 0 ? 'restock' : 'adjustment',
    admin: admin._id,
    note,
  });
  await audit(admin, 'product.stock', id, { delta, note });
  return Product.findById(id).lean();
}

// ---------- customers ----------
export async function listUsers({ q, page, limit }) {
  const filter = q
    ? { $or: [{ name: new RegExp(escapeRe(q), 'i') }, { email: new RegExp(escapeRe(q), 'i') }] }
    : {};
  const [items, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    User.countDocuments(filter),
  ]);
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}
/** Rules: nobody edits themselves here; only a super admin changes roles or staff accounts. */
export async function updateUser(admin, id, patch) {
  if (String(admin._id) === String(id))
    throw ApiError.badRequest('You cannot change your own account here');
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  const isSuper = admin.role === 'superadmin';
  if (patch.role !== undefined && !isSuper)
    throw ApiError.forbidden('Only a super admin can change roles');
  if (!isSuper && user.role !== 'customer')
    throw ApiError.forbidden('Only a super admin can change staff accounts');
  await User.updateOne({ _id: id }, patch);
  if (patch.isActive === false)
    await RefreshToken.updateMany({ user: id, revokedAt: null }, { revokedAt: new Date() }); // kick them out now
  await audit(admin, 'user.update', id, patch);
  return User.findById(id).lean();
}

// ---------- coupons ----------
export const listCoupons = () => Coupon.find().sort({ createdAt: -1 }).lean();
export async function createCoupon(admin, data) {
  const coupon = await Coupon.create(data);
  await audit(admin, 'coupon.create', coupon._id, { code: coupon.code });
  return coupon;
}
export async function updateCoupon(admin, id, data) {
  const coupon = await Coupon.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await audit(admin, 'coupon.update', id, data);
  return coupon;
}
export async function deleteCoupon(admin, id) {
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await audit(admin, 'coupon.delete', id, { code: coupon.code });
}

// ---------- inventory ----------
export async function inventoryOverview() {
  const [lowStock, history] = await Promise.all([
    Product.find({ deletedAt: null, stock: { $lt: 5 } })
      .sort({ stock: 1 })
      .limit(25)
      .select('name sku stock')
      .lean(),
    InventoryTransaction.find()
      .sort({ createdAt: -1 })
      .limit(40)
      .populate('product', 'name sku')
      .populate('admin', 'name')
      .lean(),
  ]);
  return { lowStock, history };
}

// ---------- reviews ----------
export async function listAdminReviews({ page, limit }) {
  const [items, total] = await Promise.all([
    Review.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('product', 'name')
      .populate('user', 'name')
      .lean(),
    Review.countDocuments(),
  ]);
  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}
export async function setReviewHidden(admin, id, isHidden) {
  const review = await Review.findByIdAndUpdate(id, { isHidden }, { new: true });
  if (!review) throw ApiError.notFound('Review not found');
  await refreshRating(review.product);
  await audit(admin, isHidden ? 'review.hide' : 'review.show', id);
  return review;
}
