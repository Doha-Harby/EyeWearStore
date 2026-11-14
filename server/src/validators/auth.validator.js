import { z } from 'zod';

const email = z.string().trim().toLowerCase().email('Enter a valid email');
const password = z.string().min(8, 'Use at least 8 characters').max(100);

// Zod strips unknown keys by default, so a sneaky `role: "admin"` in the body is discarded.
export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your name').max(80),
  email,
  password,
});
export const loginSchema = z.object({ email, password: z.string().min(1, 'Enter your password') });
export const forgotSchema = z.object({ email });
export const resetSchema = z.object({ token: z.string().min(10), password });
export const verifySchema = z.object({ token: z.string().min(10) });
