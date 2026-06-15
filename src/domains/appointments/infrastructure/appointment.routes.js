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

router.get('/stats', authMiddleware, adminMiddleware, (req, res) => controller.getStats(req, res));

router.get('/all', authMiddleware, adminMiddleware, (req, res) => controller.getAllAppointments(req, res));

router.get('/slots', controller.getSlots);
router.get('/user', authMiddleware, controller.getUserAppointments);
router.post('/', authMiddleware, validateCreateAppointment, controller.create);
router.put('/:id/cancel', authMiddleware, validateCancelAppointment, controller.cancel);
router.patch('/:id/status', authMiddleware, adminMiddleware, validateUpdateAppointmentStatus, (req, res) =>
  controller.updateStatus(req, res)
);

export default router;
