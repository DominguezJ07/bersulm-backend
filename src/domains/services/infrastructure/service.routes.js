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

router.get('/', (req, res) => serviceController.getAll(req, res));
router.get('/:id', (req, res) => serviceController.getById(req, res));

router.post('/', authMiddleware, adminMiddleware, validateCreateService, (req, res) =>
  serviceController.create(req, res)
);
router.put('/:id', authMiddleware, adminMiddleware, validateUpdateService, (req, res) =>
  serviceController.update(req, res)
);
router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteService, (req, res) =>
  serviceController.delete(req, res)
);

export default router;
