import mongoose from 'mongoose';

const named = (extra = {}) =>
  new mongoose.Schema(
    {
      name: { type: String, required: true, unique: true, trim: true },
      slug: { type: String, required: true, unique: true },
      description: String,
      ...extra,
    },
    { timestamps: true },
  );

export const Category = mongoose.model('Category', named({ image: String }));
export const Brand = mongoose.model('Brand', named({ logo: String }));
