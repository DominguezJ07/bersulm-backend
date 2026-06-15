import {
  AppointmentNotFound,
  InvalidStatusTransition,
  AppointmentAlreadyFinished
} from '../domain/AppointmentErrors.js';
import { ForbiddenError } from '../../../shared/domain/DomainError.js';

const ALLOWED_ADMIN_TRANSITIONS = {
  pending: ['confirmed'],
  confirmed: ['completed'],
  completed: [],
  cancelled: []
};

export class UpdateAppointmentStatusUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   */
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  /**
   * @param {Object} params
   * @param {string} params.appointmentId
   * @param {string} params.newStatus
   * @param {Object} params.adminUser
   * @param {string} params.adminUser.role
   * @returns {Promise<import('../domain/Appointment.entity').Appointment>}
   */
  async execute({ appointmentId, newStatus, adminUser }) {
    if (!adminUser || adminUser.role !== 'admin') {
      throw new ForbiddenError('Solo los administradores pueden cambiar el estado de las citas');
    }

    const validStatuses = ['confirmed', 'completed'];
    if (!validStatuses.includes(newStatus)) {
      throw new InvalidStatusTransition('?', newStatus);
    }

    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new AppointmentNotFound();
    }

    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      throw new AppointmentAlreadyFinished();
    }

    const allowedNext = ALLOWED_ADMIN_TRANSITIONS[appointment.status] || [];
    if (!allowedNext.includes(newStatus)) {
      throw new InvalidStatusTransition(appointment.status, newStatus);
    }

    appointment.status = newStatus;

    const updated = await this.appointmentRepository.update(appointment);
    return updated;
  }
}
