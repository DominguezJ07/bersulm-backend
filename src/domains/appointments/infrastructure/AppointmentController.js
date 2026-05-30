import { CreateAppointmentUseCase } from '../application/CreateAppointmentUseCase.js';
import { GetAvailableSlotsUseCase } from '../application/GetAvailableSlotsUseCase.js';
import { CancelAppointmentUseCase } from '../application/CancelAppointmentUseCase.js';
import { GetUserAppointmentsUseCase } from '../application/GetUserAppointmentsUseCase.js';
import { MongoAppointmentRepository } from './MongoAppointmentRepository.js';

const appointmentRepository = new MongoAppointmentRepository();
const createAppointmentUseCase = new CreateAppointmentUseCase(appointmentRepository, null);
const getAvailableSlotsUseCase = new GetAvailableSlotsUseCase(appointmentRepository);
const cancelAppointmentUseCase = new CancelAppointmentUseCase(appointmentRepository, null);
const getUserAppointmentsUseCase = new GetUserAppointmentsUseCase(appointmentRepository);

export class AppointmentController {
  async create(req, res) {
    try {
      const userId = req.user?.id || req.body.userId;
      const { serviceId, date, time } = req.body;

      if (!userId || !serviceId || !date || !time) {
        return res.status(400).json({
          success: false,
          message: 'userId, serviceId, date and time are required'
        });
      }

      const appointment = await createAppointmentUseCase.execute({ userId, serviceId, date, time });

      res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getSlots(req, res) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required'
        });
      }

      const slots = await getAvailableSlotsUseCase.execute(date);
      res.json({ success: true, data: slots });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user?.id || req.body.userId;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Appointment id is required'
        });
      }

      const appointment = await cancelAppointmentUseCase.execute(id, userId, reason);
      res.json({ success: true, data: appointment });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getUserAppointments(req, res) {
    try {
      const userId = req.user?.id || req.params.userId;
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'User id is required'
        });
      }

      const appointments = await getUserAppointmentsUseCase.execute(userId);
      res.json({ success: true, data: appointments });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}
