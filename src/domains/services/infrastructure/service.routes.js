import { Router } from 'express';
import { ServiceController } from './ServiceController.js';

const router = Router();
const serviceController = new ServiceController();

// Public routes
router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

// Admin routes (Middleware will be added later)
router.post('/', serviceController.create);
router.put('/:id', serviceController.update);
router.delete('/:id', serviceController.delete);

export default router;
