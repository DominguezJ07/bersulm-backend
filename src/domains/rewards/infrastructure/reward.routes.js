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

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', authMiddleware, adminMiddleware, validateCreateReward, (req, res) => controller.create(req, res));
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateReward, (req, res) => controller.update(req, res));
router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteReward, (req, res) => controller.delete(req, res));

export default router;
