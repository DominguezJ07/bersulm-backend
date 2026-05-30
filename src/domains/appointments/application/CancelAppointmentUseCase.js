import { AppointmentNotFound, CannotCancelPastAppointment } from '../domain/AppointmentErrors.js';

export class CancelAppointmentUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   * @param {any} loyaltyService
   */
  constructor(appointmentRepository, loyaltyService) {
    this.appointmentRepository = appointmentRepository;
    this.loyaltyService = loyaltyService;
  }

  /**
   * @param {string} id
   * @param {string} userId
   * @param {string} reason
   */
  async execute(id, userId, reason) {
    const appointment = await this.appointmentRepository.findById(id);
    if (!appointment || appointment.userId !== userId) {
      throw new AppointmentNotFound();
    }

    if (appointment.status === 'cancelled' || appointment.status === 'completed') {
      throw new CannotCancelPastAppointment();
    }

    // Check if appointment is in the past (simplified)
    const now = new Date();
    const appDate = new Date(`${appointment.date}T${appointment.time}`);
    if (appDate < now) {
      throw new CannotCancelPastAppointment();
    }

    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelReason = reason;

    const updated = await this.appointmentRepository.update(appointment);

    // Subtract visit from loyalty card
    if (this.loyaltyService && this.loyaltyService.removeVisit) {
      await this.loyaltyService.removeVisit(userId);
    }

    return updated;
  }
}
