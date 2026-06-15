import { useCases } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import {
  notifyNewAppointment,
  notifyCancelledAppointment
} from '../../../shared/infrastructure/socket/SocketManager.js';

export class AppointmentController {
  constructor() {
    this.createAppointmentUseCase = useCases.appointments.create();
    this.getAvailableSlotsUseCase = useCases.appointments.getSlots();
    this.cancelAppointmentUseCase = useCases.appointments.cancel();
    this.getUserAppointmentsUseCase = useCases.appointments.getUserAppointments();
    this.getAppointmentStatsUseCase = useCases.appointments.getStats();
    this.getAllAppointmentsUseCase = useCases.appointments.getAll();
    this.updateAppointmentStatusUseCase = useCases.appointments.updateStatus();
  }

  async create(req, res) {
    try {
      const userId = req.user.id;
      const { serviceId, date, time } = req.body;

      if (!serviceId || !date || !time) {
        return res.status(400).json({ success: false, message: 'serviceId, date and time are required' });
      }

      const appointment = await this.createAppointmentUseCase.execute({ userId, serviceId, date, time });

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

      const slots = await this.getAvailableSlotsUseCase.execute(date);
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

      const appointment = await this.cancelAppointmentUseCase.execute(id, userId, reason);

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

      const { appointments, total } = await this.getUserAppointmentsUseCase.execute(userId, { page, limit });

      const { statusCode, body } = ApiResponse.paginated(appointments, page, limit, total);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message);
      res.status(statusCode).json(body);
    }
  }

  async getStats(req, res) {
    try {
      const stats = await this.getAppointmentStatsUseCase.execute();
      const { statusCode, body } = ApiResponse.success(stats);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async getAllAppointments(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status || null;

      const { appointments, total } = await this.getAllAppointmentsUseCase.execute({
        page,
        limit,
        status
      });

      const { statusCode, body } = ApiResponse.paginated(appointments, page, limit, total);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const adminUser = req.user;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'El campo status es requerido'
        });
      }

      const appointment = await this.updateAppointmentStatusUseCase.execute({
        appointmentId: id,
        newStatus: status,
        adminUser
      });

      const { statusCode, body } = ApiResponse.success(appointment);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
