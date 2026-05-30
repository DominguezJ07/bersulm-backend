import jwt from 'jsonwebtoken';
import env from '../../../config/env.js';

export class JwtService {
  constructor() {
    this.accessSecret = env.JWT_SECRET;
    this.refreshSecret = env.JWT_REFRESH_SECRET;
  }

  generateAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, { expiresIn: '15m' });
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '30d' });
  }

  verifyAccessToken(token) {
    return jwt.verify(token, this.accessSecret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, this.refreshSecret);
  }
}

export default new JwtService();
