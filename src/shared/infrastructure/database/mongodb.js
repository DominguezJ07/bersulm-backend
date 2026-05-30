import mongoose from 'mongoose';
import env from '../../../config/env.js';

const connect = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
  } catch (err) {
    console.error('MongoDB initial connection error:', err);
    throw err;
  }
};

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected');
});

export default {
  connect,
  mongoose
};
