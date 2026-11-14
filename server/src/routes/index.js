import { Router } from 'express';
import { isDbConnected } from '../config/db.js';
import authRoutes from './auth.routes.js';
import accountRoutes from './account.routes.js';
import paymentRoutes from './payment.routes.js';
import adminRoutes from './admin.routes.js';
import orderRoutes from './order.routes.js';
import catalogRoutes from './catalog.routes.js';
import { sendSuccess } from '../utils/response.js';

const router = Router();

router.get('/health', (_req, res) =>
  sendSuccess(res, {
    status: 'ok',
    database: isDbConnected() ? 'connected' : 'disconnected',
    uptime: Math.round(process.uptime()),
  }),
);

router.use('/auth', authRoutes);
router.use('/', catalogRoutes);
// Public routes must be mounted BEFORE routers that call router.use(requireAuth), which guards everything after it.
router.use('/payments', paymentRoutes);
router.use('/', orderRoutes);
router.use('/', accountRoutes);
router.use('/admin', adminRoutes);

// Later phases mount here: router.use('/auth', authRoutes), router.use('/products', ...)

export default router;
