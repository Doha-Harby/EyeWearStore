import mongoose from 'mongoose';

const { ObjectId } = mongoose.Schema.Types;
const model = (name, def, opts, indexes = []) => {
  const s = new mongoose.Schema(def, { timestamps: true, ...opts });
  indexes.forEach((i) => s.index(...i));
  return mongoose.model(name, s);
};

export const Review = model(
  'Review',
  {
    product: { type: ObjectId, ref: 'Product', required: true },
    user: { type: ObjectId, ref: 'User', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    comment: { type: String, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  {},
  [[{ user: 1, product: 1 }, { unique: true }]], // one review per user per product
);
export const Wishlist = model('Wishlist', {
  user: { type: ObjectId, ref: 'User', unique: true },
  products: [{ type: ObjectId, ref: 'Product' }],
});
export const Address = model('Address', {
  user: { type: ObjectId, ref: 'User', required: true, index: true },
  label: String,
  fullName: String,
  phone: String,
  line1: String,
  line2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  isDefault: Boolean,
});
export const Coupon = model('Coupon', {
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, min: 0, required: true },
  minOrder: { type: Number, default: 0 },
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});
export const InventoryTransaction = model('InventoryTransaction', {
  product: { type: ObjectId, ref: 'Product', required: true, index: true },
  delta: { type: Number, required: true },
  reason: {
    type: String,
    enum: ['order', 'cancel', 'restock', 'adjustment', 'seed'],
    required: true,
  },
  order: { type: ObjectId, ref: 'Order' },
  admin: { type: ObjectId, ref: 'User' },
  note: String,
});
export const RefreshToken = model(
  'RefreshToken',
  {
    user: { type: ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    family: { type: String, index: true },
    expiresAt: { type: Date, required: true },
    revokedAt: Date,
  },
  {},
  [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]], // MongoDB deletes expired tokens automatically (TTL)
);
export const NewsletterSubscriber = model('NewsletterSubscriber', {
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
});
export const AuditLog = model('AuditLog', {
  admin: { type: ObjectId, ref: 'User' },
  action: String,
  target: String,
  meta: Object,
});
