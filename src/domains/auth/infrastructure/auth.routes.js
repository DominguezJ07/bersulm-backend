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

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);
router.post('/fcm-token', authMiddleware, validateFcmToken, authController.registerFcmToken);
router.get('/users/search', authMiddleware, adminMiddleware, validateSearchUsers, authController.searchUsers);

export default router;
