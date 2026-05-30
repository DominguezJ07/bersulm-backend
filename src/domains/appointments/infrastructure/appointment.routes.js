import { Router } from 'express';
import { AppointmentController } from './AppointmentController.js';

const router = Router();
const controller = new AppointmentController();

router.get('/slots', controller.getSlots);
router.get('/user/:userId', controller.getUserAppointments);
router.post('/', controller.create);
router.put('/:id/cancel', controller.cancel);

export default router;
