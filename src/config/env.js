import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT || '3000', 10);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bersulm';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (NODE_ENV === 'production') {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required env var ${key}`);
    }
  }
} else {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set, using default mongodb://localhost:27017/bersulm');
  }
  if (!JWT_SECRET) {
    console.warn('JWT_SECRET not set — using insecure default for development');
  }
  if (!JWT_REFRESH_SECRET) {
    console.warn('JWT_REFRESH_SECRET not set — using insecure default for development');
  }
}

export default {
  PORT,
  MONGODB_URI,
  JWT_SECRET: JWT_SECRET || 'dev_jwt_secret',
  JWT_REFRESH_SECRET: JWT_REFRESH_SECRET || 'dev_refresh_secret',
  ALLOWED_ORIGINS,
  LOG_LEVEL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  NODE_ENV
};
