import { Router } from 'express';
import { RewardController } from './RewardController.js';

const router = Router();
const controller = new RewardController();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export default router;
