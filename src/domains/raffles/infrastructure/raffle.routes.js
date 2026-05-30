import { Router } from 'express';
import { RaffleController } from './RaffleController.js';

const router = Router();
const controller = new RaffleController();

router.get('/current', controller.getCurrent);
router.post('/vote', controller.vote);
router.post('/spin', controller.spin);
router.get('/votes', controller.getVotes);

export default router;
