import app from './app.js';
import mongodb from './shared/infrastructure/database/mongodb.js';
import env from './config/env.js';

let server;

const start = async () => {
  try {
    await mongodb.connect();

    server = app.listen(env.PORT, () => {
      console.log(`Server listening on port ${env.PORT}`);
    });

    const graceful = async (signal) => {
      console.log(`Received ${signal}. Shutting down gracefully...`);
      if (server) server.close(() => console.log('HTTP server closed'));
      try {
        await mongodb.mongoose.connection.close(false);
        console.log('MongoDB connection closed');
      } catch (err) {
        console.error('Error closing MongoDB connection', err);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => graceful('SIGINT'));
    process.on('SIGTERM', () => graceful('SIGTERM'));

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection', reason);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();
