import mongoose from 'mongoose';

export const SHAPES = ['round', 'square', 'rectangle', 'aviator', 'cat-eye', 'wayfarer', 'oval'];
export const GENDERS = ['men', 'women', 'unisex'];

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    sku: { type: String, required: true, unique: true, uppercase: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator(v) {
          return v == null || v < this.price;
        },
        message: 'Discount price must be lower than price',
      },
    },
    stock: { type: Number, default: 0, min: 0 },
    frameShape: { type: String, enum: SHAPES },
    frameMaterial: String,
    colors: [{ name: String, hex: String }],
    gender: { type: String, enum: GENDERS, default: 'unisex' },
    dimensions: { lens: Number, bridge: Number, temple: Number },
    images: [String],
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }, // soft delete, so products can be restored
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.index({ name: 'text', description: 'text' });
schema.index({ category: 1, brand: 1, price: 1 });
schema.index({ createdAt: -1 });

export const Product = mongoose.model('Product', schema);
