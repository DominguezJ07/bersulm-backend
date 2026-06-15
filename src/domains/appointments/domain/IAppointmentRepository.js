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
   * Find appointments by user ID with pagination
   * @param {string} userId
   * @param {{ skip?: number, limit?: number }} [options]
   * @returns {Promise<{ appointments: import('./Appointment.entity').Appointment[], total: number }>}
   */
  async findByUserId(userId, options) {
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

  /**
   * Count all appointments
   * @returns {Promise<number>}
   */
  async countAll() {
    throw new Error('Not implemented');
  }

  /**
   * Count appointments by month
   * @param {string} month - Format YYYY-MM
   * @returns {Promise<number>}
   */
  async countByMonth(month) {
    throw new Error('Not implemented');
  }

  /**
   * Count appointments grouped by status
   * @returns {Promise<{pending: number, confirmed: number, completed: number, cancelled: number}>}
   */
  async countByStatus() {
    throw new Error('Not implemented');
  }

  /**
   * Find all appointments with pagination (admin only)
   * @param {{ skip?: number, limit?: number, status?: string|null }} options
   * @returns {Promise<{ appointments: Object[], total: number }>}
   */
  async findAll(options) {
    throw new Error('Not implemented');
  }
}
