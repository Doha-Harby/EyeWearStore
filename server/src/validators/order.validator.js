import { z } from 'zod';

const eye = z.object({
  sph: z.coerce.number().min(-20).max(20),
  cyl: z.coerce.number().min(-10).max(10).default(0),
  axis: z.coerce.number().int().min(0).max(180).optional(),
});
/** Lens details travel with the order line so the lab knows exactly what to make. */
export const prescriptionSchema = z
  .object({
    type: z.enum(['single-vision', 'progressive', 'reading']),
    coating: z.enum(['none', 'anti-reflective', 'blue-light', 'photochromic']).default('none'),
    od: eye, // right eye
    os: eye, // left eye
    pd: z.coerce.number().min(40).max(80).optional(),
    note: z.string().trim().max(300).optional(),
  })
  .optional();

const text = (min = 1) => z.string().trim().min(min, 'Required').max(120);
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product'),
        qty: z.coerce.number().int().min(1).max(10),
        color: z.string().max(40).optional(),
        prescription: prescriptionSchema,
      }),
    )
    .min(1, 'Your cart is empty')
    .max(20),
  shippingAddress: z.object({
    fullName: text(2),
    phone: text(6),
    line1: text(3),
    line2: z.string().max(120).optional(),
    city: text(),
    postalCode: text(3),
    country: text(2),
  }),
  shippingMethod: z.enum(['standard', 'express']),
  paymentMethod: z.enum(['cod', 'stripe']), // card payments (Stripe) are a later step
  couponCode: z.string().trim().max(40).optional(),
});
export const couponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.coerce.number().min(0),
});
