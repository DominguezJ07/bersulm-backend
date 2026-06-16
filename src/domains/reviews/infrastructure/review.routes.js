import { Router } from 'express';
import { ReviewController } from './ReviewController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';

const router = Router();
const controller = new ReviewController();

// Público — ver reseñas aprobadas
router.get('/', (req, res) => controller.getApproved(req, res));

// Cliente autenticado — crear reseña
router.post('/', authMiddleware, (req, res) => controller.create(req, res));

// Admin — ver reseñas pendientes
router.get('/pending', authMiddleware, adminMiddleware, (req, res) => controller.getPending(req, res));

// Admin — aprobar o rechazar
router.patch('/:id/status', authMiddleware, adminMiddleware, (req, res) => controller.approve(req, res));

// Admin — eliminar
router.delete('/:id', authMiddleware, adminMiddleware, (req, res) => controller.delete(req, res));

export default router;
