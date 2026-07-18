import app from './app';
import { config } from './config';
import { logger } from './utils/logger';
import Database from './config/database';
import fs from 'fs';
import path from 'path';

// Ensure upload directories exist
const uploadDirs = [
  path.resolve(config.upload.dir),
  path.resolve(config.upload.dir, 'profiles'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    logger.info(`Created upload directory: ${dir}`);
  }
});

// Ensure log directory exists
const logDir = path.resolve('logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 EMS Server running on http://${config.host}:${config.port}`);
  logger.info(`📝 Environment: ${config.env}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);

  server.close(async () => {
    await Database.disconnect();
    logger.info('Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});
