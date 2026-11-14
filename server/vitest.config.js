import { defineConfig } from 'vitest/config';

// Safe dummy settings so tests never need a real .env or database.
export default defineConfig({
  test: { env: { NODE_ENV: 'test', MONGODB_URI: 'mongodb://localhost:27017/lumiere-test', JWT_ACCESS_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'b'.repeat(40) } },
});
