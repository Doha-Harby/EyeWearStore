import { z } from 'zod';

const text = (min = 1) => z.string().trim().min(min, 'Required').max(120);
export const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().regex(/^[a-f\d]{24}$/i, 'Invalid product'),
        qty: z.coerce.number().int().min(1).max(10),
        color: z.string().max(40).optional(),
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
  paymentMethod: z.literal('cod'), // card payments (Stripe) are a later step
  couponCode: z.string().trim().max(40).optional(),
});
export const couponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  subtotal: z.coerce.number().min(0),
});
