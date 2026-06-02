import { Router } from 'express';
import { RewardController } from './RewardController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import {
  validateCreateReward,
  validateUpdateReward,
  validateDeleteReward
} from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new RewardController();

router.get('/', controller.getAll);
router.post('/', authMiddleware, adminMiddleware, validateCreateReward, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateReward, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteReward, controller.delete);

export default router;
