import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
];
const { ObjectId } = mongoose.Schema.Types;

/** Items are SNAPSHOTS (name, price, image at purchase time) so old orders never change when products do. */
const itemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: 'Product' },
    name: String,
    sku: String,
    image: String,
    color: String,
    price: Number,
    qty: { type: Number, min: 1 },
    prescription: Object,
  },
  { _id: false },
);

const schema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, required: true },
    user: { type: ObjectId, ref: 'User', required: true, index: true },
    items: [itemSchema],
    shippingAddress: Object,
    shippingMethod: String,
    paymentMethod: { type: String, enum: ['cod', 'stripe'], required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending' },
    subtotal: Number,
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: Number,
    couponCode: String,
  },
  { timestamps: true },
);
schema.index({ user: 1, createdAt: -1 });
schema.index({ status: 1, createdAt: -1 });

export const Order = mongoose.model('Order', schema);
