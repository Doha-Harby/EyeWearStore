import * as admin from '../services/admin.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

export const dashboard = asyncHandler(async (_req, res) =>
  sendSuccess(res, await admin.dashboard()),
);
export const listOrders = asyncHandler(async (req, res) => {
  const { items, meta } = await admin.listOrders(req.query);
  sendSuccess(res, items, { meta });
});
export const updateStatus = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.updateOrderStatus(req.user, req.params.id, req.body.status), {
    message: 'Order updated',
  }),
);
