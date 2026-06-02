import { CreateAppointmentUseCase } from '../application/CreateAppointmentUseCase.js';
import { GetAvailableSlotsUseCase } from '../application/GetAvailableSlotsUseCase.js';
import { CancelAppointmentUseCase } from '../application/CancelAppointmentUseCase.js';
import { GetUserAppointmentsUseCase } from '../application/GetUserAppointmentsUseCase.js';
import { MongoAppointmentRepository } from './MongoAppointmentRepository.js';
import { MongoServiceRepository } from '../../services/infrastructure/MongoServiceRepository.js';
import { MongoLoyaltyRepository } from '../../loyalty/infrastructure/MongoLoyaltyRepository.js';
import { AddVisitUseCase } from '../../loyalty/application/AddVisitUseCase.js';
import { MongoRewardRepository } from '../../rewards/infrastructure/MongoRewardRepository.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import {
  notifyNewAppointment,
  notifyCancelledAppointment
} from '../../../shared/infrastructure/socket/SocketManager.js';

const appointmentRepository = new MongoAppointmentRepository();
const serviceRepository = new MongoServiceRepository();
const loyaltyRepository = new MongoLoyaltyRepository();
const rewardRepository = new MongoRewardRepository();
const addVisitUseCase = new AddVisitUseCase(loyaltyRepository, rewardRepository);
const createAppointmentUseCase = new CreateAppointmentUseCase(
  appointmentRepository,
  addVisitUseCase,
  serviceRepository
);
const getAvailableSlotsUseCase = new GetAvailableSlotsUseCase(appointmentRepository);
const cancelAppointmentUseCase = new CancelAppointmentUseCase(appointmentRepository, addVisitUseCase);
const getUserAppointmentsUseCase = new GetUserAppointmentsUseCase(appointmentRepository);

export class AppointmentController {
  async create(req, res) {
    try {
      const userId = req.user.id;
      const { serviceId, date, time } = req.body;

      if (!serviceId || !date || !time) {
        return res.status(400).json({ success: false, message: 'serviceId, date and time are required' });
      }

      const appointment = await createAppointmentUseCase.execute({ userId, serviceId, date, time });

      notifyNewAppointment(appointment);

      const { statusCode, body } = ApiResponse.created(appointment);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getSlots(req, res) {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ success: false, message: 'Date is required' });
      }

      const slots = await getAvailableSlotsUseCase.execute(date);
      const { statusCode, body } = ApiResponse.success(slots);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const appointment = await cancelAppointmentUseCase.execute(id, userId, reason);

      notifyCancelledAppointment(appointment);

      const { statusCode, body } = ApiResponse.success(appointment);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getUserAppointments(req, res) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const appointments = await getUserAppointmentsUseCase.execute(userId);
      const total = appointments.length;
      const paginated = appointments.slice(skip, skip + limit);

      const { statusCode, body } = ApiResponse.paginated(paginated, page, limit, total);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }
}
