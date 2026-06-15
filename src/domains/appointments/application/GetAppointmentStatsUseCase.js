export class GetAppointmentStatsUseCase {
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  async execute() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [total, thisMonth, byStatus] = await Promise.all([
      this.appointmentRepository.countAll(),
      this.appointmentRepository.countByMonth(currentMonth),
      this.appointmentRepository.countByStatus()
    ]);

    return {
      total,
      thisMonth,
      byStatus: {
        pending: byStatus.pending || 0,
        confirmed: byStatus.confirmed || 0,
        completed: byStatus.completed || 0,
        cancelled: byStatus.cancelled || 0
      }
    };
  }
}
