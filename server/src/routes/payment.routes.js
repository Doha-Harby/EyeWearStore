import { Router } from 'express';
import { createCheckoutSession, paymentsEnabled } from '../services/payment.service.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();
// The checkout page uses this to decide whether to offer card payment.
router.get('/config', (_req, res) => sendSuccess(res, { stripe: paymentsEnabled() }));
router.post(
  '/orders/:id/session',
  requireAuth,
  asyncHandler(async (req, res) =>
    sendSuccess(res, await createCheckoutSession(req.user, req.params.id)),
  ),
);
export default router;
