import { Router } from 'express';
import * as c from '../controllers/order.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderSchema, couponSchema } from '../validators/order.validator.js';

const router = Router();
router.use(['/orders', '/coupons'], requireAuth); // scoped: must not guard routes mounted after this router
router.post('/orders', validate({ body: orderSchema }), c.create);
router.get('/orders/my-orders', c.mine); // must come before /orders/:id
router.get('/orders/:id/invoice', c.invoice);
router.get('/orders/:id', c.get);
router.post('/orders/:id/cancel', c.cancel);
router.post('/coupons/validate', validate({ body: couponSchema }), c.coupon);
export default router;
