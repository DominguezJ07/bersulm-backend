import mongoose from 'mongoose';

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  // Domain errors with statusCode
  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message, code: err.name });
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ success: false, message: err.message, code: 'ValidationError' });
  }

  // Duplicate key
  if (err.code && err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate key error', code: 'DuplicateKey' });
  }

  // JWT errors
  if (err.name && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    return res.status(401).json({ success: false, message: err.message, code: err.name });
  }

  // Fallback
  res.status(500).json({ success: false, message: 'Internal Server Error', code: 'InternalError' });
};
