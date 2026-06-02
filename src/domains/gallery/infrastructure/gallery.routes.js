import { Router } from 'express';
import { GalleryController } from './GalleryController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import { validateCreateGalleryItem, validateDeleteGalleryItem } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new GalleryController();

router.get('/', controller.getAll);
router.post('/', authMiddleware, adminMiddleware, validateCreateGalleryItem, controller.create);
router.delete('/:id', authMiddleware, adminMiddleware, validateDeleteGalleryItem, controller.delete);

export default router;
