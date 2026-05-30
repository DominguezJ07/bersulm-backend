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
    const allSlots = this._generateSlots();
    
    const appointments = await this.appointmentRepository.findByDate(date);
    const bookedSlots = appointments
      .filter(a => a.status !== 'cancelled')
      .map(a => a.time);
      
    const blockedSlots = await this.appointmentRepository.findBlockedSlots(date);
    
    return allSlots.filter(slot => 
      !bookedSlots.includes(slot) && !blockedSlots.includes(slot)
    );
  }

  _generateSlots() {
    const slots = [];
    let hour = 9;
    let min = 0;
    
    while (hour < 18 || (hour === 18 && min <= 30)) {
      const hStr = hour.toString().padStart(2, '0');
      const mStr = min.toString().padStart(2, '0');
      slots.push(`${hStr}:${mStr}`);
      
      min += 30;
      if (min === 60) {
        hour++;
        min = 0;
      }
    }
    return slots;
  }
}
