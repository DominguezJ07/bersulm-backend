import { generateSlots } from '../../../shared/domain/SlotsHelper.js';

export class GetAvailableSlotsUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   */
  constructor(appointmentRepository) {
    this.appointmentRepository = appointmentRepository;
  }

  /**
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<string[]>}
   */
  async execute(date) {
    const allSlots = generateSlots();

    const appointments = await this.appointmentRepository.findByDate(date);
    const bookedSlots = appointments.filter((a) => a.status !== 'cancelled').map((a) => a.time);

    const blockedSlots = await this.appointmentRepository.findBlockedSlots(date);

    return allSlots.filter((slot) => !bookedSlots.includes(slot) && !blockedSlots.includes(slot));
  }
}
