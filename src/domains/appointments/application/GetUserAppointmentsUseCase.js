export class GetUserAppointmentsUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   */
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  /**
   * @param {string} userId
   * @param {{ page?: number, limit?: number }} [options]
   * @returns {Promise<{ appointments: import('../domain/Appointment.entity').Appointment[], total: number }>}
   */
  async execute(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;
    return this.appointmentRepository.findByUserId(userId, { skip, limit });
  }
}
