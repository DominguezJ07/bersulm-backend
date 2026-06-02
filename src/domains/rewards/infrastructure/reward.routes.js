import { Router } from 'express';
import { RewardController } from './RewardController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';

const router = Router();
const controller = new RewardController();

router.get('/', controller.getAll);
router.post('/', authMiddleware, adminMiddleware, controller.create);
router.put('/:id', authMiddleware, adminMiddleware, controller.update);
router.delete('/:id', authMiddleware, adminMiddleware, controller.delete);

export default router;
