/**
 * @interface IAppointmentRepository
 */
export class IAppointmentRepository {
  /**
   * @param {string} id
   * @returns {Promise<import('./Appointment.entity').Appointment | null>}
   */
  async findById(id) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} userId
   * @returns {Promise<import('./Appointment.entity').Appointment[]>}
   */
  async findByUserId(userId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} date
   * @returns {Promise<import('./Appointment.entity').Appointment[]>}
   */
  async findByDate(date) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} date
   * @returns {Promise<string[]>} - Returns array of 'HH:mm'
   */
  async findBlockedSlots(date) {
    throw new Error('Not implemented');
  }

  /**
   * @param {import('./Appointment.entity').Appointment} appointment
   * @returns {Promise<import('./Appointment.entity').Appointment>}
   */
  async save(appointment) {
    throw new Error('Not implemented');
  }

  /**
   * @param {import('./Appointment.entity').Appointment} appointment
   * @returns {Promise<import('./Appointment.entity').Appointment>}
   */
  async update(appointment) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @param {string} [reason]
   * @returns {Promise<import('./Appointment.entity').Appointment | null>}
   */
  async cancel(id, reason) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} month - formato 'YYYY-MM'
   * @returns {Promise<string[]>}
   */
  async findCompletedUsersByMonth(month) {
    throw new Error('Not implemented');
  }
}
