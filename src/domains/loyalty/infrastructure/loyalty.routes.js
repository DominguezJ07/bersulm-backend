import { Router } from 'express';
import { LoyaltyController } from './LoyaltyController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import { validateAddVisit, validateRevealCard, validateIdParam } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new LoyaltyController();

router.get('/', authMiddleware, controller.getCard);
router.post('/visit', authMiddleware, adminMiddleware, validateAddVisit, controller.addVisit);
router.post('/spin', controller.spinCard);
router.get('/minigame', authMiddleware, controller.initMinigame);
router.post('/minigame/reveal', authMiddleware, validateRevealCard, controller.revealCard);
router.get('/user/:id', authMiddleware, adminMiddleware, validateIdParam, controller.getUserCard);

export default router;
