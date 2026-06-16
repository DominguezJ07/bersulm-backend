import { useCases } from '../../../shared/infrastructure/container.js';
import { ApiResponse } from '../../../shared/domain/ApiResponse.js';
import { AppointmentModel } from './AppointmentModel.js';
import { UserModel } from '../../auth/infrastructure/UserModel.js';
import {
  notifyNewAppointment,
  notifyCancelledAppointment,
  notifyAppointmentConfirmed,
  notifyAppointmentCompleted,
  notifyAppointmentCancelledByAdmin
} from '../../../shared/infrastructure/socket/SocketManager.js';
import FirebaseService from '../../../shared/infrastructure/firebase/FirebaseService.js';

async function sendPushToAppointmentOwner(appointment, notification) {
  try {
    const userId = appointment.userId?._id?.toString() || appointment.userId?.toString() || appointment.userId;
    if (!userId) return;

    const user = await UserModel.findById(userId).select('fcmTokens').lean();
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) return;

    await FirebaseService.sendMulticast(user.fcmTokens, notification);
  } catch (err) {
    console.warn('Push notification failed:', err.message);
  }
}

export class AppointmentController {
  constructor() {
    this.createAppointmentUseCase = useCases.appointments.create();
    this.getAvailableSlotsUseCase = useCases.appointments.getSlots();
    this.cancelAppointmentUseCase = useCases.appointments.cancel();
    this.getUserAppointmentsUseCase = useCases.appointments.getUserAppointments();
    this.getAppointmentStatsUseCase = useCases.appointments.getStats();
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
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status || null;
      const skip = (page - 1) * limit;

      const filter = status ? { status } : {};
      const [docs, total] = await Promise.all([
        AppointmentModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('userId', 'name email phone')
          .populate('serviceId', 'name price durationMin')
          .lean(),
        AppointmentModel.countDocuments(filter)
      ]);

      const { statusCode, body } = ApiResponse.paginated(docs, page, limit, total);
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

      if (!adminUser || adminUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Solo administradores pueden cambiar estados'
        });
      }

      const validTransitions = {
        pending: ['confirmed'],
        confirmed: ['completed'],
        completed: [],
        cancelled: []
      };

      const appointment = await AppointmentModel.findById(id).lean();
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      const allowed = validTransitions[appointment.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `No se puede cambiar de '${appointment.status}' a '${status}'`
        });
      }

      const updated = await AppointmentModel.findByIdAndUpdate(id, { status }, { new: true })
        .populate('userId', 'name email phone')
        .populate('serviceId', 'name price durationMin')
        .lean();

      if (status === 'confirmed') {
        notifyAppointmentConfirmed(updated);
        await sendPushToAppointmentOwner(updated, {
          title: 'Cita confirmada',
          body: `Tu cita del ${updated.date} a las ${updated.time} ha sido confirmada.`,
          data: {
            type: 'appointment_confirmed',
            appointmentId: updated._id.toString(),
            date: updated.date,
            time: updated.time
          }
        });
      } else if (status === 'completed') {
        notifyAppointmentCompleted(updated);
        await sendPushToAppointmentOwner(updated, {
          title: 'Cita completada',
          body: 'Gracias por visitarnos. Esperamos verte pronto!',
          data: {
            type: 'appointment_completed',
            appointmentId: updated._id.toString()
          }
        });
      }

      const { statusCode, body } = ApiResponse.success(updated);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }

  async cancelAsAdmin(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await AppointmentModel.findById(id).lean();
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Cita no encontrada'
        });
      }

      if (appointment.status === 'cancelled' || appointment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'No se puede cancelar esta cita'
        });
      }

      const updated = await AppointmentModel.findByIdAndUpdate(
        id,
        {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelReason: reason || 'Cancelada por administrador'
        },
        { new: true }
      )
        .populate('userId', 'name email phone')
        .populate('serviceId', 'name price durationMin')
        .lean();

      notifyAppointmentCancelledByAdmin(updated);
      await sendPushToAppointmentOwner(updated, {
        title: 'Cita cancelada',
        body: `Tu cita del ${updated.date} a las ${updated.time} ha sido cancelada.`,
        data: {
          type: 'appointment_cancelled_by_admin',
          appointmentId: updated._id.toString(),
          date: updated.date,
          time: updated.time
        }
      });

      const { statusCode, body } = ApiResponse.success(updated);
      res.status(statusCode).json(body);
    } catch (error) {
      const { statusCode, body } = ApiResponse.error(error.message, error.statusCode || 500);
      res.status(statusCode).json(body);
    }
  }
}
