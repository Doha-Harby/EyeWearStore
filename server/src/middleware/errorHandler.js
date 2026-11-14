import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

export const notFound = (req, _res, next) =>
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));

/** Single place where every error becomes a JSON response. Internal details never leak in production. */
export function errorHandler(err, _req, res, _next) {
  let status = 500;
  let message = 'Something went wrong. Please try again.';
  let errors;

  if (err instanceof ApiError) {
    ({ status, message, errors } = err);
  } else if (err instanceof ZodError) {
    status = 400;
    message = 'Please check the highlighted fields';
    errors = Object.fromEntries(err.issues.map((i) => [i.path.join('.') || 'form', i.message]));
  } else if (err?.name === 'ValidationError') {
    status = 400; // Mongoose schema validation
    message = 'Validation failed';
    errors = Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v.message]));
  } else if (err?.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  } else if (err?.code === 11000) {
    status = 409; // duplicate key (e.g. email or SKU already exists)
    message = `${Object.keys(err.keyPattern || {})[0] || 'Value'} already exists`;
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body';
  }

  if (status >= 500) console.error(err); // log real bugs server-side only
  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!env.isProd && status >= 500 && { stack: err?.stack }),
  });
}
