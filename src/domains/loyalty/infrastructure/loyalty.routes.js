import { Router } from 'express';
import { LoyaltyController } from './LoyaltyController.js';

const router = Router();
const controller = new LoyaltyController();

router.get('/', controller.getCard);
router.post('/visit', controller.addVisit);
router.post('/claim', controller.claimReward);
router.post('/spin', controller.spinCard);

export default router;
