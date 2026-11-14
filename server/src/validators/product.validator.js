import { z } from 'zod';

const opt = z.string().trim().optional();
export const productQuerySchema = z.object({
  q: opt,
  category: opt,
  brand: opt,
  shape: opt,
  material: opt,
  gender: opt,
  color: opt,
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'popular']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
});
