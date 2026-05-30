import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './domains/auth/infrastructure/auth.routes.js';
import serviceRoutes from './domains/services/infrastructure/service.routes.js';
import appointmentRoutes from './domains/appointments/infrastructure/appointment.routes.js';
import galleryRoutes from './domains/gallery/infrastructure/gallery.routes.js';
import rewardRoutes from './domains/rewards/infrastructure/reward.routes.js';
import raffleRoutes from './domains/raffles/infrastructure/raffle.routes.js';
import loyaltyRoutes from './domains/loyalty/infrastructure/loyalty.routes.js';

import { errorHandler } from './shared/middlewares/errorHandler.js';

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/gallery', galleryRoutes);
app.use('/api/v1/rewards', rewardRoutes);
app.use('/api/v1/raffles', raffleRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);

// Health
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (last)
app.use(errorHandler);

export default app;
