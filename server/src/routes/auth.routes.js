import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as c from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  verifySchema,
} from '../validators/auth.validator.js';

const router = Router();
// Stricter limit on credential endpoints to slow down password guessing.
router.use(
  ['/login', '/register', '/forgot-password'],
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }),
);

router.post('/register', validate({ body: registerSchema }), c.register);
router.post('/login', validate({ body: loginSchema }), c.login);
router.post('/refresh', c.refresh);
router.post('/logout', c.logout);
router.get('/me', requireAuth, c.me);
router.post('/verify-email', validate({ body: verifySchema }), c.verifyEmail);
router.post('/forgot-password', validate({ body: forgotSchema }), c.forgotPassword);
router.post('/reset-password', validate({ body: resetSchema }), c.resetPassword);

export default router;
