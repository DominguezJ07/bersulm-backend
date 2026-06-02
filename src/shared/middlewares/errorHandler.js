import mongoose from 'mongoose';

export const errorHandler = (err, req, res, next) => {
  const logger = req.log || console;

  if (err.statusCode) {
    return res.status(err.statusCode).json({ success: false, message: err.message, code: err.name });
  }

  if (err instanceof mongoose.Error.ValidationError) {
    logger.warn({ err }, 'Mongoose validation error');
    return res.status(400).json({ success: false, message: err.message, code: 'ValidationError' });
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    logger.warn({ err }, 'Malformed JSON');
    return res.status(400).json({ success: false, message: 'Malformed JSON', code: 'SyntaxError' });
  }

  if (err.code && err.code === 11000) {
    logger.warn({ err }, 'Duplicate key error');
    return res.status(409).json({ success: false, message: 'Duplicate key error', code: 'DuplicateKey' });
  }

  if (err.name && (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError')) {
    return res.status(401).json({ success: false, message: err.message, code: err.name });
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ success: false, message: 'Internal Server Error', code: 'InternalError' });
};
