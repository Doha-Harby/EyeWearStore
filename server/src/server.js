import app from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error(`Could not connect to MongoDB at ${env.MONGODB_URI}\n  ${err.message}`);
    console.error(
      '  Tip: run `docker compose up -d` in the repo root, or point MONGODB_URI at Atlas.',
    );
    process.exit(1);
  }
  const server = app.listen(env.PORT, () =>
    console.log(`API ready on http://localhost:${env.PORT}/api`),
  );

  const shutdown = async (signal) => {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start();
