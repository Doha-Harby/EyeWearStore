import mongoose from 'mongoose';
import { Review } from '../models/Misc.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

/** Keeps the product's cached average + count in sync. Hidden reviews are excluded. */
export async function refreshRating(productId) {
  const [r] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(String(productId)), isHidden: false } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    { ratingAvg: r ? Math.round(r.avg * 10) / 10 : 0, ratingCount: r?.n ?? 0 },
  );
}

export const listReviews = (productId) =>
  Review.find({ product: productId, isHidden: false })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'name')
    .lean();

export async function createReview(user, productId, data) {
  if (!(await Product.exists({ _id: productId, deletedAt: null })))
    throw ApiError.notFound('Product not found');
  if (await Review.exists({ user: user._id, product: productId }))
    throw ApiError.conflict('You have already reviewed this product');
  // Anyone signed in can review, but only buyers (a delivered order containing it) get the "Verified purchase" badge.
  const verifiedPurchase = !!(await Order.exists({
    user: user._id,
    'items.product': productId,
    status: 'delivered',
  }));
  const review = await Review.create({
    ...data,
    user: user._id,
    product: productId,
    verifiedPurchase,
  });
  await refreshRating(productId);
  return review;
}

export async function updateReview(user, id, data) {
  const review = await Review.findOne({ _id: id, user: user._id }); // ownership check is part of the query
  if (!review) throw ApiError.notFound('Review not found');
  review.set(data);
  await review.save();
  await refreshRating(review.product);
  return review;
}

export async function deleteReview(user, id) {
  const isStaff = ['admin', 'superadmin'].includes(user.role);
  const review = await Review.findOneAndDelete({ _id: id, ...(!isStaff && { user: user._id }) });
  if (!review) throw ApiError.notFound('Review not found');
  await refreshRating(review.product);
}
