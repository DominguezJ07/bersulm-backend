import jwt from 'jsonwebtoken';
import env from '../../../config/env.js';
import { ITokenService } from '../../../domains/auth/domain/ITokenService.js';

export class JwtService extends ITokenService {
  constructor() {
    super();
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
