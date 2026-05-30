import { Appointment } from '../domain/Appointment.entity.js';
import { SlotNotAvailable } from '../domain/AppointmentErrors.js';

export class CreateAppointmentUseCase {
  /**
   * @param {import('../domain/IAppointmentRepository').IAppointmentRepository} appointmentRepository
   * @param {any} loyaltyService - Placeholder for loyalty service/repo
   */
  constructor(appointmentRepository, loyaltyService) {
    this.appointmentRepository = appointmentRepository;
    this.loyaltyService = loyaltyService;
  }

  /**
   * @param {Object} data
   * @param {string} data.userId
   * @param {string} data.serviceId
   * @param {string} data.date
   * @param {string} data.time
   * @param {number} data.totalPrice
   * @param {string} [data.notes]
   */
  async execute(data) {
    // 1. Check availability
    const existing = await this.appointmentRepository.findByDate(data.date);
    const isBooked = existing.some(a => a.time === data.time && a.status !== 'cancelled');
    if (isBooked) throw new SlotNotAvailable();

    const blocked = await this.appointmentRepository.findBlockedSlots(data.date);
    if (blocked.includes(data.time)) throw new SlotNotAvailable();

    // 2. Create appointment
    const appointment = Appointment.create(data);
    const saved = await this.appointmentRepository.save(appointment);

    // 3. Update loyalty card (async, don't block response if possible or wait if required)
    if (this.loyaltyService && this.loyaltyService.addVisit) {
      await this.loyaltyService.addVisit(data.userId);
    }

    return saved;
  }
}
