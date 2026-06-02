import { Router } from 'express';
import { ServiceController } from './ServiceController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import {
  validateCreateService,
  validateUpdateService,
  validateDeleteService
} from '../../../shared/middlewares/validators.js';

const router = Router();
const serviceController = new ServiceController();

router.get('/', serviceController.getAll);
router.get('/:id', serviceController.getById);

router.post('/', authMiddleware, adminMiddleware, validateCreateService, serviceController.create);
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateService, serviceController.update);
router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteService, serviceController.delete);

export default router;
