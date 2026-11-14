import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

export const adminOrdersQuery = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  q: z.string().trim().max(40).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});
export const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });
