import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);

/** Connects to MongoDB. Fails fast (5s) so a wrong URI is obvious during development. */
export async function connectDB() {
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}

export const disconnectDB = () => mongoose.disconnect();
export const isDbConnected = () => mongoose.connection.readyState === 1;

let pending;
/** Connects once and shares the connection between requests (and warm serverless invocations). Retries after a failure. */
export function ensureDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  pending ??= connectDB().catch((err) => {
    pending = undefined;
    throw err;
  });
  return pending;
}
