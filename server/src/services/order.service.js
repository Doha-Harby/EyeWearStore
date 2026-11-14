import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { Coupon, InventoryTransaction } from '../models/Misc.js';
import { ApiError } from '../utils/ApiError.js';

export const SHIPPING = { standard: 8, express: 20 };
export const FREE_SHIPPING_OVER = 150;
const round = (n) => Math.round(n * 100) / 100;

/** Pure function (easy to unit-test): the discount a coupon gives on a subtotal. */
export function computeDiscount(coupon, subtotal) {
  if (!coupon || !coupon.isActive) throw ApiError.badRequest('This coupon is not valid');
  if (coupon.expiresAt && coupon.expiresAt < new Date())
    throw ApiError.badRequest('This coupon has expired');
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit)
    throw ApiError.badRequest('This coupon has been fully used');
  if (subtotal < coupon.minOrder)
    throw ApiError.badRequest(`Spend at least $${coupon.minOrder} to use this coupon`);
  return round(
    coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal),
  );
}

export async function previewCoupon(code, subtotal) {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  return { code: coupon?.code, discount: computeDiscount(coupon, subtotal) };
}

/**
 * Creates an order inside a database transaction: either EVERYTHING happens (stock decremented,
 * inventory logged, coupon counted, order saved) or NOTHING does. Prices always come from the
 * database, never from the browser, so a tampered cart cannot change what is charged.
 */
export async function createOrder(userId, input) {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      const products = await Product.find({
        _id: { $in: input.items.map((i) => i.productId) },
        isActive: true,
        deletedAt: null,
      }).session(session);
      const byId = new Map(products.map((p) => [p.id, p]));
      const lines = [];
      for (const item of input.items) {
        const p = byId.get(item.productId);
        if (!p) throw ApiError.badRequest('An item in your cart is no longer available');
        // Conditional atomic update: it only succeeds if enough stock remains, so two shoppers
        // buying the last pair at the same moment cannot both succeed (no overselling).
        const res = await Product.updateOne(
          { _id: p._id, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty, sold: item.qty } },
          { session },
        );
        if (!res.modifiedCount) throw ApiError.conflict(`Sorry, ${p.name} is low on stock`);
        lines.push({
          product: p._id,
          name: p.name,
          sku: p.sku,
          image: p.images[0],
          color: item.color,
          price: p.discountPrice ?? p.price,
          qty: item.qty,
        });
      }
      const subtotal = round(lines.reduce((n, l) => n + l.price * l.qty, 0));
      let discount = 0;
      let couponCode;
      if (input.couponCode) {
        const coupon = await Coupon.findOne({ code: input.couponCode.toUpperCase() }).session(
          session,
        );
        discount = computeDiscount(coupon, subtotal);
        await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } }, { session });
        couponCode = coupon.code;
      }
      const shippingCost = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING[input.shippingMethod];
      [order] = await Order.create(
        [
          {
            orderNumber: `LUM-${Date.now().toString(36).toUpperCase()}`,
            user: userId,
            items: lines,
            shippingAddress: input.shippingAddress,
            shippingMethod: input.shippingMethod,
            paymentMethod: input.paymentMethod,
            subtotal,
            discount,
            shippingCost,
            total: round(subtotal - discount + shippingCost),
            couponCode,
          },
        ],
        { session },
      );
      await InventoryTransaction.insertMany(
        lines.map((l) => ({
          product: l.product,
          delta: -l.qty,
          reason: 'order',
          order: order._id,
        })),
        { session },
      );
    });
    return order;
  } finally {
    await session.endSession();
  }
}

export const listMyOrders = (userId) => Order.find({ user: userId }).sort({ createdAt: -1 }).lean();

/** Ownership check: a customer can only ever load their own orders (admins can load any). */
export async function getOrder(user, id) {
  const order = await Order.findOne({
    _id: id,
    ...(['admin', 'superadmin'].includes(user.role) ? {} : { user: user._id }),
  }).lean();
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}

/** Cancelling puts the stock back, in the same transaction as the status change. */
export async function cancelOrder(user, id) {
  const session = await mongoose.startSession();
  try {
    let order;
    await session.withTransaction(async () => {
      order = await Order.findOne({
        _id: id,
        ...(['admin', 'superadmin'].includes(user.role) ? {} : { user: user._id }),
      }).session(session);
      if (!order) throw ApiError.notFound('Order not found');
      if (!['pending', 'confirmed'].includes(order.status))
        throw ApiError.conflict('This order can no longer be cancelled');
      for (const l of order.items)
        await Product.updateOne(
          { _id: l.product },
          { $inc: { stock: l.qty, sold: -l.qty } },
          { session },
        );
      await InventoryTransaction.insertMany(
        order.items.map((l) => ({
          product: l.product,
          delta: l.qty,
          reason: 'cancel',
          order: order._id,
        })),
        { session },
      );
      order.status = 'cancelled';
      await order.save({ session });
    });
    return order;
  } finally {
    await session.endSession();
  }
}
