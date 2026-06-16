import { useCases, repos } from '../../../shared/infrastructure/container.js';
import BcryptService from '../../../shared/infrastructure/bcrypt/BcryptService.js';
import JwtService from '../../../shared/infrastructure/jwt/JwtService.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { UpdateProfileUseCase } from '../application/UpdateProfileUseCase.js';
import { ChangePasswordUseCase } from '../application/ChangePasswordUseCase.js';
import { UpdateAvatarUseCase } from '../application/UpdateAvatarUseCase.js';

const userRepository = repos.user();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(userRepository, BcryptService);
const updateAvatarUseCase = new UpdateAvatarUseCase(userRepository);

export class AuthController {
  constructor() {
    this.registerUseCase = useCases.auth.register();
    this.loginUseCase = useCases.auth.login();
    this.searchUsersUseCase = useCases.auth.searchUsers();
    this.userRepository = repos.user();
  }

  async register(req, res) {
    try {
      const { name, email, phone, password } = req.body;
      const user = await this.registerUseCase.execute({ name, email, phone, password });

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
      const { user, token, refreshToken } = await this.loginUseCase.execute({ email, password });

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

      const user = await this.userRepository.findByEmail(decoded.email);
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
      const users = await this.searchUsersUseCase.execute(q.trim());
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

      const user = await this.userRepository.addFcmToken(userId, fcmToken);
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

  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { name, phone } = req.body;
      const user = await updateProfileUseCase.execute({
        userId,
        name,
        phone
      });
      const { statusCode, body } = ApiResponse.success(user);
      res.status(statusCode).json(body);
    } catch (error) {
      console.error('updateProfile error:', error);
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      const result = await changePasswordUseCase.execute({
        userId,
        currentPassword,
        newPassword
      });
      const { statusCode, body } = ApiResponse.success(result);
      res.status(statusCode).json(body);
    } catch (error) {
      console.error('changePassword error:', error);
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async updateAvatar(req, res) {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ninguna imagen'
        });
      }
      const user = await updateAvatarUseCase.execute({
        userId,
        buffer: req.file.buffer,
        mimetype: req.file.mimetype
      });
      const { statusCode, body } = ApiResponse.success(user);
      res.status(statusCode).json(body);
    } catch (error) {
      console.error('updateAvatar error:', error.message);
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
