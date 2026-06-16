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
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'));
    }
  }
});

const router = Router();
const authController = new AuthController();

router.post('/register', validateRegister, (req, res) => authController.register(req, res));

router.post('/login', validateLogin, (req, res) => authController.login(req, res));

router.post('/refresh-token', validateRefreshToken, (req, res) => authController.refreshToken(req, res));

router.post('/fcm-token', authMiddleware, validateFcmToken, (req, res) => authController.registerFcmToken(req, res));

router.get('/users/search', authMiddleware, adminMiddleware, validateSearchUsers, (req, res) =>
  authController.searchUsers(req, res)
);

router.put('/profile', authMiddleware, (req, res) => authController.updateProfile(req, res));

router.put('/password', authMiddleware, (req, res) => authController.changePassword(req, res));

router.post('/avatar', authMiddleware, upload.single('avatar'), (req, res) => authController.updateAvatar(req, res));

export default router;
