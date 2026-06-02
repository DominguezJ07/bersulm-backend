import { Router } from 'express';
import { AppointmentController } from './AppointmentController.js';
import { authMiddleware } from '../../../shared/middlewares/auth.middleware.js';
import { validateCreateAppointment, validateCancelAppointment } from '../../../shared/middlewares/validators.js';

const router = Router();
const controller = new AppointmentController();

router.get('/slots', controller.getSlots);
router.get('/user', authMiddleware, controller.getUserAppointments);
router.post('/', authMiddleware, validateCreateAppointment, controller.create);
router.put('/:id/cancel', authMiddleware, validateCancelAppointment, controller.cancel);

export default router;
