import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
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
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(
  '/api',
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }),
);

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
