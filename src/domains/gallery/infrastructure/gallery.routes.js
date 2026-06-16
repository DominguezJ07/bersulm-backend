import { Router } from 'express';
import { GalleryController } from './GalleryController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import { validateCreateGalleryItem, validateDeleteGalleryItem } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new GalleryController();

router.get('/', (req, res) => controller.getAll(req, res));

router.post('/', authMiddleware, adminMiddleware, validateCreateGalleryItem, (req, res) => controller.create(req, res));

router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteGalleryItem, (req, res) =>
  controller.delete(req, res)
);

export default router;
