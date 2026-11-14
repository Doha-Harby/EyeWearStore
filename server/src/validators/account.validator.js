import { z } from 'zod';

const t = (min = 1, max = 120) => z.string().trim().min(min, 'Required').max(max);
export const profileSchema = z.object({
  name: t(2, 80),
  phone: z.string().trim().max(30).optional(),
});
export const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: z.string().min(8, 'Use at least 8 characters').max(100),
});
export const addressSchema = z.object({
  label: z.string().trim().max(30).optional(),
  fullName: t(2),
  phone: t(6, 30),
  line1: t(3),
  line2: z.string().trim().max(120).optional(),
  city: t(),
  state: z.string().trim().max(60).optional(),
  postalCode: t(3, 20),
  country: t(2, 60),
  isDefault: z.boolean().default(false),
});
export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().max(2000).optional(),
});
