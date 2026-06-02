import { Router } from 'express';
import { AuthController } from './AuthController.js';
import { validateRegister, validateLogin, validateRefreshToken } from '../../../shared/middlewares/validators.js';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', validateRefreshToken, authController.refreshToken);

export default router;
