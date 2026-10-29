import './env';
import { app } from './app';

async function shutdown(signal: string) {
  console.log(`Received ${signal}, shutting down gracefully...`);
  try {
    await app.close();
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});
