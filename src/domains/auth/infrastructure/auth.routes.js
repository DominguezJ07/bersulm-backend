import { Router } from 'express';
import { AuthController } from './AuthController.js';
import {
  validateRegister,
  validateLogin,
  validateRefreshToken,
  validateSearchUsers,
  validateFcmToken
} from '../../../shared/middlewares/validators.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRegister, (req, res) => authController.register(req, res));

router.post('/login', validateLogin, (req, res) => authController.login(req, res));

router.post('/refresh-token', validateRefreshToken, (req, res) => authController.refreshToken(req, res));

router.post('/fcm-token', authMiddleware, validateFcmToken, (req, res) => authController.registerFcmToken(req, res));

router.get('/users/search', authMiddleware, adminMiddleware, validateSearchUsers, (req, res) =>
  authController.searchUsers(req, res)
);

export default router;
