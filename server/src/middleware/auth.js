import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Verifies the access cookie, then loads the user FROM THE DATABASE. Role and active status are
 * therefore always current; nothing the client sends (or an old token claims) can grant privileges.
 */
export const requireAuth = asyncHandler(async (req, _res, next) => {
  let payload;
  try {
    payload = jwt.verify(req.cookies.accessToken || '', env.JWT_ACCESS_SECRET);
  } catch {
    throw ApiError.unauthorized();
  }
  const user = await User.findById(payload.sub);
  if (!user?.isActive) throw ApiError.unauthorized();
  req.user = user;
  next();
});

/** Usage: router.get('/admin/x', requireAuth, authorize('admin', 'superadmin'), handler) */
export const authorize =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user.role) ? next() : next(ApiError.forbidden());
