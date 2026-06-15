export class GetAllAppointmentsUseCase {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute({ page = 1, limit = 10, status = null } = {}) {
    const skip = (page - 1) * limit;
    const { appointments, total } = await this.appointmentRepository.findAll({ skip, limit, status });
    return { appointments, total };
  }
}
