import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/Misc.js';
import { ApiError } from '../utils/ApiError.js';
import { sendMail } from '../utils/mailer.js';

const DAY = 864e5;
const rand = () => crypto.randomBytes(32).toString('hex');
// Tokens are stored HASHED (keyed HMAC). A leaked database cannot be used to impersonate anyone.
const hash = (t) => crypto.createHmac('sha256', env.JWT_REFRESH_SECRET).update(t).digest('hex');

export const signAccess = (user) =>
  jwt.sign({ sub: user.id }, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });

async function issueRefresh(userId, family = rand()) {
  const token = rand();
  await RefreshToken.create({
    user: userId,
    tokenHash: hash(token),
    family,
    expiresAt: new Date(Date.now() + 7 * DAY),
  });
  return token;
}
const session = async (user, family) => ({
  user,
  access: signAccess(user),
  refresh: await issueRefresh(user.id, family),
});

export async function register({ name, email, password }) {
  const token = rand();
  // `role` is deliberately not accepted here: everyone registers as a customer.
  const user = await User.create({ name, email, password, verifyTokenHash: hash(token) });
  await sendMail({
    to: email,
    subject: 'Verify your LUMIÈRE account',
    text: `Confirm your email: ${env.CLIENT_URL}/verify-email?token=${token}`,
  });
  return session(user);
}

export async function login({ email, password }) {
  const user = await User.findOne({ email }).select('+password');
  // Same message for "no such user" and "wrong password" so attackers cannot probe for accounts.
  if (!user || !(await user.comparePassword(password)))
    throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated');
  return session(user);
}

/** Refresh-token rotation: each token works once. Re-using an old one means theft, so we kill the whole family. */
export async function rotate(token) {
  const rec = token && (await RefreshToken.findOne({ tokenHash: hash(token) }));
  if (!rec) throw ApiError.unauthorized('Session expired');
  if (rec.revokedAt) {
    await RefreshToken.updateMany(
      { family: rec.family, revokedAt: null },
      { revokedAt: new Date() },
    );
    throw ApiError.unauthorized('Session expired');
  }
  const user = await User.findById(rec.user);
  if (rec.expiresAt < new Date() || !user?.isActive) throw ApiError.unauthorized('Session expired');
  rec.revokedAt = new Date();
  await rec.save();
  return session(user, rec.family);
}

export const logout = (token) =>
  token && RefreshToken.updateOne({ tokenHash: hash(token) }, { revokedAt: new Date() });

export async function verifyEmail(token) {
  const user = await User.findOneAndUpdate(
    { verifyTokenHash: hash(token) },
    { emailVerified: true, $unset: { verifyTokenHash: 1 } },
  );
  if (!user) throw ApiError.badRequest('This verification link is invalid or already used');
}

export async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return; // respond identically either way (no account enumeration)
  const token = rand();
  await User.updateOne(
    { _id: user._id },
    { resetTokenHash: hash(token), resetExpires: new Date(Date.now() + 36e5) },
  );
  await sendMail({
    to: email,
    subject: 'Reset your LUMIÈRE password',
    text: `Reset link (valid 1 hour): ${env.CLIENT_URL}/reset-password?token=${token}`,
  });
}

export async function resetPassword(token, password) {
  const user = await User.findOne({
    resetTokenHash: hash(token),
    resetExpires: { $gt: new Date() },
  }).select('+password');
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');
  user.password = password;
  user.resetTokenHash = undefined;
  user.resetExpires = undefined;
  await user.save();
  await RefreshToken.updateMany({ user: user._id, revokedAt: null }, { revokedAt: new Date() }); // sign out everywhere
}
