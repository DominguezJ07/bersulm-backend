import { Router } from 'express';
import { GalleryController } from './GalleryController.js';

const router = Router();
const controller = new GalleryController();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/:id', controller.delete);

export default router;
