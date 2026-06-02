import { Router } from 'express';
import { LoyaltyController } from './LoyaltyController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import { validateAddVisit } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new LoyaltyController();

router.get('/', authMiddleware, controller.getCard);
router.post('/visit', authMiddleware, adminMiddleware, validateAddVisit, controller.addVisit);
router.post('/claim', authMiddleware, controller.claimReward);
router.post('/spin', controller.spinCard);

export default router;
