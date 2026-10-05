/**
 * @interface IRaffleRepository
 */
export class IRaffleRepository {
  /**
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findCurrent() {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} month
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findByMonth(month) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findById(id) {
    throw new Error('Not implemented');
  }

  /**
   * @param {import('./Raffle.entity').Raffle} raffle
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async save(raffle) {
    throw new Error('Not implemented');
  }

  /**
   * @param {import('./Raffle.entity').Raffle} raffle
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async update(raffle) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} raffleId
   * @param {{ name: string, userId?: string }} participant
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async addManualParticipant(raffleId, participant) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} raffleId
   * @param {string} participantId
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async removeManualParticipant(raffleId, participantId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} raffleId
   * @returns {Promise<import('./Raffle.entity').Raffle['manualParticipants']>}
   */
  async getManualParticipants(raffleId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} raffleId
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async findByIdWithParticipants(raffleId) {
    throw new Error('Not implemented');
  }

  /**
   * @param {object} raffleData
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async create(raffleData) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @param {object} data
   * @returns {Promise<Object>}
   */
  async updateById(id, data) {
    throw new Error('Not implemented');
  }

  /**
   * Find all raffles with pagination
   * @param {{ skip?: number, limit?: number }} options
   * @returns {Promise<{ raffles: import('./Raffle.entity').Raffle[], total: number }>}
   */
  async findAll(options) {
    throw new Error('Not implemented');
  }

  /**
   * Find completed raffles with pagination
   * @param {{ skip?: number, limit?: number }} options
   * @returns {Promise<{ raffles: Object[], total: number }>}
   */
  async findCompleted(options) {
    throw new Error('Not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async deleteById(id) {
    throw new Error('Not implemented');
  }
}
