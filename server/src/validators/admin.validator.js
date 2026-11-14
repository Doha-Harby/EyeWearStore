import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

export const adminOrdersQuery = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});
export const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

import { SHAPES, GENDERS } from '../models/Product.js';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose an option');
// HTML forms send '' for empty optional fields; treat that as "not provided".
const blank = (schema) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const productInput = z.object({
  name: z.string().trim().min(2, 'Enter a name').max(120),
  sku: z.string().trim().min(2, 'Enter a SKU').max(30),
  brand: objectId,
  category: objectId,
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  discountPrice: blank(z.coerce.number().min(0)),
  stock: z.coerce.number().int().min(0).default(0),
  frameShape: blank(z.enum(SHAPES)),
  frameMaterial: blank(z.string().trim().max(40)),
  gender: z.enum(GENDERS).default('unisex'),
  description: z.string().trim().max(3000).default(''),
  images: z.array(z.string().url('Each image must be a full URL (https://...)')).max(8).default([]),
  colors: z
    .array(z.object({ name: z.string().max(30), hex: z.string().regex(/^#[0-9a-f]{6}$/i) }))
    .max(8)
    .default([]),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});
export const stockSchema = z.object({
  delta: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, 'Enter a non-zero amount'),
  note: z.string().trim().max(200).optional(),
});
export const adminProductsQuery = z.object({
  q: z.string().trim().max(60).optional(),
  deleted: z.enum(['true', 'false']).default('false'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export const listQuery = z.object({
  q: z.string().trim().max(60).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});
export const customerPatch = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(['customer', 'admin', 'superadmin']).optional(),
});
export const hideSchema = z.object({ isHidden: z.boolean() });
const couponBase = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'At least 3 characters')
    .max(30)
    .transform((s) => s.toUpperCase()),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().positive('Must be above zero'),
  minOrder: z.coerce.number().min(0).default(0),
  expiresAt: blank(z.coerce.date()),
  usageLimit: blank(z.coerce.number().int().min(1)),
  isActive: z.boolean().default(true),
});
export const couponInput = couponBase.refine((d) => d.type !== 'percent' || d.value <= 100, {
  message: 'A percentage cannot exceed 100',
  path: ['value'],
});
export const couponPatch = couponBase.partial();
