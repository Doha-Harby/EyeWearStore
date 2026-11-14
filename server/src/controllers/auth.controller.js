import { env } from '../config/env.js';
import * as auth from '../services/auth.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/response.js';

// HttpOnly = JavaScript cannot read the cookies, so an XSS bug cannot steal the tokens.
// SameSite=Lax blocks cross-site form posts (CSRF). The refresh cookie is only sent to /api/auth.
const base = { httpOnly: true, sameSite: 'lax', secure: env.isProd };
const setCookies = (res, { access, refresh }) => {
  res.cookie('accessToken', access, { ...base, maxAge: 15 * 60e3 });
  res.cookie('refreshToken', refresh, { ...base, path: '/api/auth', maxAge: 7 * 864e5 });
};
const clearCookies = (res) => {
  res.clearCookie('accessToken', base);
  res.clearCookie('refreshToken', { ...base, path: '/api/auth' });
};

export const register = asyncHandler(async (req, res) => {
  const s = await auth.register(req.body);
  setCookies(res, s);
  sendSuccess(
    res,
    { user: s.user },
    { status: 201, message: 'Account created. Check your email to verify it.' },
  );
});
export const login = asyncHandler(async (req, res) => {
  const s = await auth.login(req.body);
  setCookies(res, s);
  sendSuccess(res, { user: s.user });
});
export const refresh = asyncHandler(async (req, res) => {
  try {
    const s = await auth.rotate(req.cookies.refreshToken);
    setCookies(res, s);
    sendSuccess(res, { user: s.user });
  } catch (e) {
    clearCookies(res);
    throw e;
  }
});
export const logout = asyncHandler(async (req, res) => {
  await auth.logout(req.cookies.refreshToken);
  clearCookies(res);
  sendSuccess(res, null, { message: 'Signed out' });
});
export const me = (req, res) => sendSuccess(res, { user: req.user });
export const verifyEmail = asyncHandler(async (req, res) => {
  await auth.verifyEmail(req.body.token);
  sendSuccess(res, null, { message: 'Email verified' });
});
export const forgotPassword = asyncHandler(async (req, res) => {
  await auth.forgotPassword(req.body.email);
  sendSuccess(res, null, { message: 'If that email exists, a reset link is on its way.' });
});
export const resetPassword = asyncHandler(async (req, res) => {
  await auth.resetPassword(req.body.token, req.body.password);
  sendSuccess(res, null, { message: 'Password updated. Please sign in.' });
});
