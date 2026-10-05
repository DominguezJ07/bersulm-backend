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
   * @param {import('../../loyalty/application/AddVisitUseCase').AddVisitUseCase} [addVisitUseCase]
   */
  constructor(appointmentRepository, addVisitUseCase = null) {
    this.appointmentRepository = appointmentRepository;
    this.addVisitUseCase = addVisitUseCase;
  }

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

    // Efecto secundario: sumar visita de fidelidad SOLO al cliente
    // de esta cita puntual, solo al completarla. Un fallo aquí no
    // debe revertir ni bloquear la cita ya completada — se registra
    // y se puede corregir manualmente vía POST /loyalty/visit.
    if (newStatus === 'completed' && this.addVisitUseCase) {
      try {
        await this.addVisitUseCase.execute(appointment.userId);
      } catch (err) {
        console.error('Error al sumar visita de fidelidad automática:', err);
      }
    }

    return updated;
  }
}
