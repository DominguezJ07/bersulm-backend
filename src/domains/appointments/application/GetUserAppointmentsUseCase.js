export class GetUserAppointmentsUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   */
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  /**
   * @param {string} userId
   */
  async execute(userId) {
    return await this.appointmentRepository.findByUserId(userId);
  }
}
