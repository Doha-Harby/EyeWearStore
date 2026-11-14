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

export const listProducts = asyncHandler(async (req, res) => {
  const { items, meta } = await admin.listAdminProducts(req.query);
  sendSuccess(res, items, { meta });
});
export const createProduct = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.createProduct(req.user, req.body), {
    status: 201,
    message: 'Product created',
  }),
);
export const updateProduct = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.updateProduct(req.user, req.params.id, req.body), {
    message: 'Product updated',
  }),
);
export const deleteProduct = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.setDeleted(req.user, req.params.id, true), {
    message: 'Product moved to trash',
  }),
);
export const restoreProduct = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.setDeleted(req.user, req.params.id, false), {
    message: 'Product restored',
  }),
);
export const adjustStock = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.adjustStock(req.user, req.params.id, req.body), {
    message: 'Stock updated',
  }),
);

export const listCustomers = asyncHandler(async (req, res) => {
  const { items, meta } = await admin.listUsers(req.query);
  sendSuccess(res, items, { meta });
});
export const updateCustomer = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.updateUser(req.user, req.params.id, req.body), {
    message: 'Account updated',
  }),
);
export const listCoupons = asyncHandler(async (_req, res) =>
  sendSuccess(res, await admin.listCoupons()),
);
export const createCoupon = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.createCoupon(req.user, req.body), {
    status: 201,
    message: 'Coupon created',
  }),
);
export const updateCoupon = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.updateCoupon(req.user, req.params.id, req.body)),
);
export const deleteCoupon = asyncHandler(async (req, res) => {
  await admin.deleteCoupon(req.user, req.params.id);
  sendSuccess(res, null);
});
export const inventory = asyncHandler(async (_req, res) =>
  sendSuccess(res, await admin.inventoryOverview()),
);
export const listReviews = asyncHandler(async (req, res) => {
  const { items, meta } = await admin.listAdminReviews(req.query);
  sendSuccess(res, items, { meta });
});
export const hideReview = asyncHandler(async (req, res) =>
  sendSuccess(res, await admin.setReviewHidden(req.user, req.params.id, req.body.isHidden)),
);
