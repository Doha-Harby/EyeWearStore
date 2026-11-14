import * as acc from '../services/account.service.js';
import * as rev from '../services/review.service.js';
import { asyncHandler as h } from '../utils/asyncHandler.js';
import { sendSuccess as ok } from '../utils/response.js';

export const getWishlist = h(async (req, res) => ok(res, await acc.getWishlist(req.user._id)));
export const addWish = h(async (req, res) => {
  await acc.addToWishlist(req.user._id, req.params.productId);
  ok(res, null, { status: 201 });
});
export const removeWish = h(async (req, res) => {
  await acc.removeFromWishlist(req.user._id, req.params.productId);
  ok(res, null);
});
export const updateProfile = h(async (req, res) =>
  ok(
    res,
    { user: await acc.updateProfile(req.user._id, req.body) },
    { message: 'Profile updated' },
  ),
);
export const changePassword = h(async (req, res) => {
  await acc.changePassword(req.user._id, req.body);
  ok(res, null, { message: 'Password changed' });
});
export const listAddresses = h(async (req, res) => ok(res, await acc.listAddresses(req.user._id)));
export const createAddress = h(async (req, res) =>
  ok(res, await acc.createAddress(req.user._id, req.body), { status: 201 }),
);
export const updateAddress = h(async (req, res) =>
  ok(res, await acc.updateAddress(req.user._id, req.params.id, req.body)),
);
export const deleteAddress = h(async (req, res) => {
  await acc.deleteAddress(req.user._id, req.params.id);
  ok(res, null);
});
export const listReviews = h(async (req, res) => ok(res, await rev.listReviews(req.params.id)));
export const createReview = h(async (req, res) =>
  ok(res, await rev.createReview(req.user, req.params.id, req.body), {
    status: 201,
    message: 'Thanks for your review',
  }),
);
export const updateReview = h(async (req, res) =>
  ok(res, await rev.updateReview(req.user, req.params.id, req.body)),
);
export const deleteReview = h(async (req, res) => {
  await rev.deleteReview(req.user, req.params.id);
  ok(res, null);
});
