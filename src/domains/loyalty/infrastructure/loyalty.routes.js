import { Router } from 'express';
import { LoyaltyController } from './LoyaltyController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import { validateAddVisit, validateRevealCard, validateIdParam } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new LoyaltyController();

router.get('/', authMiddleware, (req, res) => controller.getCard(req, res));

router.post('/visit', authMiddleware, adminMiddleware, validateAddVisit, (req, res) => controller.addVisit(req, res));

router.post('/spin', (req, res) => controller.spinCard(req, res));

router.get('/minigame', authMiddleware, (req, res) => controller.initMinigame(req, res));

router.post('/minigame/reveal', authMiddleware, validateRevealCard, (req, res) => controller.revealCard(req, res));

router.get('/user/:id', authMiddleware, adminMiddleware, validateIdParam, (req, res) =>
  controller.getUserCard(req, res)
);

export default router;
