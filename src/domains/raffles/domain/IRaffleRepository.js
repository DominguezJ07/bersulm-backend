/**
 * @interface IRaffleRepository
 */
export class IRaffleRepository {
  /**
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findCurrent() { throw new Error('Not implemented'); }

  /**
   * @param {string} month
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findByMonth(month) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<import('./Raffle.entity').Raffle | null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * @param {import('./Raffle.entity').Raffle} raffle
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async save(raffle) { throw new Error('Not implemented'); }

  /**
   * @param {import('./Raffle.entity').Raffle} raffle
   * @returns {Promise<import('./Raffle.entity').Raffle>}
   */
  async update(raffle) { throw new Error('Not implemented'); }

  /**
   * @param {string} raffleId
   * @param {string} userId
   * @returns {Promise<void>}
   */
  async addParticipant(raffleId, userId) { throw new Error('Not implemented'); }

  /**
   * @param {string} raffleId
   * @returns {Promise<import('./RewardVote.entity').RewardVote[]>}
   */
  async getVotesByRaffle(raffleId) { throw new Error('Not implemented'); }

  /**
   * @param {string} raffleId
   * @param {string} userId
   * @returns {Promise<import('./RewardVote.entity').RewardVote | null>}
   */
  async getUserVote(raffleId, userId) { throw new Error('Not implemented'); }
}
