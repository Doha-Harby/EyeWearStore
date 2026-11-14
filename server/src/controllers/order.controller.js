import * as orders from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await orders.createOrder(req.user._id, req.body), {
    status: 201,
    message: 'Order placed',
  }),
);
export const mine = asyncHandler(async (req, res) =>
  sendSuccess(res, await orders.listMyOrders(req.user._id)),
);
export const get = asyncHandler(async (req, res) =>
  sendSuccess(res, await orders.getOrder(req.user, req.params.id)),
);
export const cancel = asyncHandler(async (req, res) =>
  sendSuccess(res, await orders.cancelOrder(req.user, req.params.id), {
    message: 'Order cancelled',
  }),
);
export const coupon = asyncHandler(async (req, res) =>
  sendSuccess(res, await orders.previewCoupon(req.body.code, req.body.subtotal)),
);
