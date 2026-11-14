import { User } from '../models/User.js';
import { Address, Wishlist } from '../models/Misc.js';
import { ApiError } from '../utils/ApiError.js';

// ----- wishlist -----
export async function getWishlist(userId) {
  const list = await Wishlist.findOne({ user: userId })
    .populate({
      path: 'products',
      match: { isActive: true, deletedAt: null },
      populate: { path: 'brand', select: 'name' },
    })
    .lean();
  return list?.products ?? [];
}
export const addToWishlist = (userId, productId) =>
  Wishlist.updateOne({ user: userId }, { $addToSet: { products: productId } }, { upsert: true }); // $addToSet: no duplicates
export const removeFromWishlist = (userId, productId) =>
  Wishlist.updateOne({ user: userId }, { $pull: { products: productId } });

// ----- profile -----
export async function updateProfile(userId, data) {
  await User.updateOne({ _id: userId }, data);
  return User.findById(userId);
}
export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+password');
  if (!(await user.comparePassword(currentPassword)))
    throw ApiError.badRequest('Your current password is incorrect', {
      currentPassword: 'Incorrect password',
    });
  user.password = newPassword; // hashed by the model's pre-save hook
  await user.save();
}

// ----- addresses (every query includes `user`, so people can only touch their own) -----
export const listAddresses = (userId) =>
  Address.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 }).lean();
async function onlyOneDefault(userId, data) {
  if (data.isDefault) await Address.updateMany({ user: userId }, { isDefault: false });
}
export async function createAddress(userId, data) {
  await onlyOneDefault(userId, data);
  return Address.create({ ...data, user: userId });
}
export async function updateAddress(userId, id, data) {
  await onlyOneDefault(userId, data);
  const address = await Address.findOneAndUpdate({ _id: id, user: userId }, data, { new: true });
  if (!address) throw ApiError.notFound('Address not found');
  return address;
}
export async function deleteAddress(userId, id) {
  if (!(await Address.findOneAndDelete({ _id: id, user: userId })))
    throw ApiError.notFound('Address not found');
}
