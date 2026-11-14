import * as orders from '../services/order.service.js';
import { orderPlaced } from '../services/notify.service.js';
import { streamInvoice } from '../services/invoice.service.js';
import { User } from '../models/User.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { sendSuccess as ok } from '../utils/response.js';

export const create = h(async (req, res) => {
  const order = await orders.createOrder(req.user._id, req.body);
  orderPlaced(order).catch((e) => console.error('Order email failed:', e.message)); // fire and forget
  ok(res, order, { status: 201, message: 'Order placed' });
});
export const mine = h(async (req, res) => ok(res, await orders.listMyOrders(req.user._id)));
export const get = h(async (req, res) => ok(res, await orders.getOrder(req.user, req.params.id)));
export const cancel = h(async (req, res) =>
  ok(res, await orders.cancelOrder(req.user, req.params.id), { message: 'Order cancelled' }),
);
export const coupon = h(async (req, res) =>
  ok(res, await orders.previewCoupon(req.body.code, req.body.subtotal)),
);
export const invoice = h(async (req, res) => {
  const order = await orders.getOrder(req.user, req.params.id); // ownership enforced here
  const customer = await User.findById(order.user).lean();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${order.orderNumber}.pdf"`);
  streamInvoice(order, customer, res);
});
