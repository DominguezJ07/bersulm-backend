import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';
import { sanitize } from './shared/middlewares/sanitize.js';
import hpp from 'hpp';

import authRoutes from './domains/auth/infrastructure/auth.routes.js';
import serviceRoutes from './domains/services/infrastructure/service.routes.js';
import appointmentRoutes from './domains/appointments/infrastructure/appointment.routes.js';
import galleryRoutes from './domains/gallery/infrastructure/gallery.routes.js';
import rewardRoutes from './domains/rewards/infrastructure/reward.routes.js';
import raffleRoutes from './domains/raffles/infrastructure/raffle.routes.js';
import loyaltyRoutes from './domains/loyalty/infrastructure/loyalty.routes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

import { errorHandler } from './shared/middlewares/errorHandler.js';
import { requestId } from './shared/middlewares/requestId.js';
import env from './config/env.js';
import mongoose from 'mongoose';

const app = express();

app.use(requestId);

app.use(helmet());
app.use(compression());

const allowedOrigins = env.ALLOWED_ORIGINS
  ? env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(
  pinoHttp({
    quietReqLogger: true,
    autoLogging: {
      ignore: (req) => req.url === '/api/v1/health'
    }
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(sanitize);
app.use(
  hpp({
    whitelist: ['date', 'category', 'type', 'status', 'page', 'limit', 'sort']
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts, please try again later' }
});

app.use('/api/v1/', apiLimiter);
app.use('/api/v1/auth/login', authLimiter);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/raffles', raffleRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);

app.get('/api/v1/health', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
    memory: process.memoryUsage()
  });
});

app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(errorHandler);

export default app;
