import { RegisterUseCase } from '../application/RegisterUseCase.js';
import { LoginUseCase } from '../application/LoginUseCase.js';
import { SearchUsersUseCase } from '../application/SearchUsersUseCase.js';
import { MongoUserRepository } from './MongoUserRepository.js';
import BcryptService from '../../../shared/infrastructure/bcrypt/BcryptService.js';
import JwtService from '../../../shared/infrastructure/jwt/JwtService.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';

const userRepository = new MongoUserRepository();
const registerUseCase = new RegisterUseCase(userRepository, BcryptService);
const loginUseCase = new LoginUseCase(userRepository, JwtService, BcryptService);
const searchUsersUseCase = new SearchUsersUseCase(userRepository);

export class AuthController {
  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      const user = await registerUseCase.execute({ name, email, phone, password });

      const { passwordHash, ...userResponse } = user;

      const { statusCode, body } = ApiResponse.created(userResponse);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token, refreshToken } = await loginUseCase.execute({ email, password });

      const { passwordHash, ...userResponse } = user;

      const { statusCode, body } = ApiResponse.success({ user: userResponse, token, refreshToken });
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }

      const decoded = JwtService.verifyRefreshToken(refreshToken);

      const user = await userRepository.findByEmail(decoded.email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const newAccessToken = JwtService.generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const newRefreshToken = JwtService.generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });

      const { statusCode, body } = ApiResponse.success({ token: newAccessToken, refreshToken: newRefreshToken });
      res.status(statusCode).json(body);
    } catch (error) {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
  }

  async searchUsers(req, res) {
    try {
      const q = req.query.q || '';
      const users = await searchUsersUseCase.execute(q.trim());
      const { statusCode, body } = ApiResponse.success(users);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async registerFcmToken(req, res) {
    try {
      const { fcmToken } = req.body;
      const userId = req.user.id;

      if (!fcmToken) {
        return res.status(400).json({ success: false, message: 'fcmToken is required' });
      }

      const user = await userRepository.addFcmToken(userId, fcmToken);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const { statusCode, body } = ApiResponse.success({ message: 'FCM token registered' });
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
