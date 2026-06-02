import pino from 'pino';
import app from './app.js';
import mongodb from './shared/infrastructure/database/mongodb.js';
import env from './config/env.js';
import { initRaffleCrons } from './shared/infrastructure/cron/RaffleCron.js';
import { initSocketServer } from './shared/infrastructure/socket/SocketManager.js';

const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV !== 'production' ? { target: 'pino-pretty' } : undefined
});

let server;

const start = async () => {
  try {
    await mongodb.connect();
    initRaffleCrons();

    server = app.listen(env.PORT, () => {
      logger.info(`Server listening on port ${env.PORT}`);
    });

    initSocketServer(server);

    const graceful = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);

      const forceExit = setTimeout(() => {
        logger.error('Forced exit after timeout');
        process.exit(1);
      }, 30000);

      if (server) {
        await new Promise((resolve) => {
          server.close(() => {
            logger.info('HTTP server closed');
            resolve();
          });
        });
      }

      try {
        await mongodb.mongoose.connection.close(false);
        logger.info('MongoDB connection closed');
      } catch (err) {
        logger.error(err, 'Error closing MongoDB connection');
      }

      clearTimeout(forceExit);
      process.exit(0);
    };

    process.on('SIGINT', () => graceful('SIGINT'));
    process.on('SIGTERM', () => graceful('SIGTERM'));

    process.on('uncaughtException', (err) => {
      logger.error(err, 'Uncaught Exception');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      logger.error(reason, 'Unhandled Rejection');
      process.exitCode = 1;
    });
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
};

start();
