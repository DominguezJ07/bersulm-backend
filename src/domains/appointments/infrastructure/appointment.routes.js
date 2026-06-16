import { Router } from 'express';
import { AppointmentController } from './AppointmentController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { adminMiddleware } from '../../../shared/middlewares/admin.middleware.js';
import {
  validateCreateAppointment,
  validateCancelAppointment,
  validateUpdateAppointmentStatus
} from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new AppointmentController();

router.get('/slots', (req, res) => controller.getSlots(req, res));

router.get('/stats', authMiddleware, adminMiddleware, (req, res) => controller.getStats(req, res));

router.get('/all', authMiddleware, adminMiddleware, (req, res) => controller.getAllAppointments(req, res));

router.get('/user', authMiddleware, (req, res) => controller.getUserAppointments(req, res));

router.post('/', authMiddleware, validateCreateAppointment, (req, res) => controller.create(req, res));

router.put('/:id/cancel', authMiddleware, validateCancelAppointment, (req, res) => controller.cancel(req, res));

router.patch('/:id/status', authMiddleware, adminMiddleware, validateUpdateAppointmentStatus, (req, res) =>
  controller.updateStatus(req, res)
);

export default router;
