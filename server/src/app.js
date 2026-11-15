import express from 'express';
import { fileURLToPath } from 'node:url';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { asyncHandler } from './utils/asyncHandler.js';
import { handleWebhook } from './services/payment.service.js';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

/** The Express app is built separately from server.js so tests can import it without opening a port. */
const app = express();

// On Render/any host, requests arrive through a reverse proxy. Trusting it makes req.ip (used by the
// rate limiter) the real visitor IP instead of the proxy's IP.
app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true })); // credentials: allow the auth cookies
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  asyncHandler(async (req, res) => {
    await handleWebhook(req.body, req.headers['stripe-signature']);
    res.json({ received: true });
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
// Product images. Mounted BEFORE the rate limiter so browsing the shop never uses up the request quota.
app.use(
  '/api/static',
  express.static(fileURLToPath(new URL('../public', import.meta.url)), {
    maxAge: '1d',
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  }),
);
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }),
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
