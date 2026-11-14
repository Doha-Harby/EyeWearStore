import { Router } from 'express';
import * as c from '../controllers/admin.controller.js';
import { requireAuth, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adminOrdersQuery, statusSchema } from '../validators/admin.validator.js';

const router = Router();
// ONE guard protects every admin route: sign-in required, then role checked against the database.
router.use(requireAuth, authorize('admin', 'superadmin'));
router.get('/dashboard', c.dashboard);
router.get('/orders', validate({ query: adminOrdersQuery }), c.listOrders);
router.patch('/orders/:id/status', validate({ body: statusSchema }), c.updateStatus);
export default router;
