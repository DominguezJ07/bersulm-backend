/**
 * @interface ILoyaltyRepository
 */
export class ILoyaltyRepository {
  /**
   * @param {string} userId
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard | null>}
   */
  async findByUserId(userId) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard | null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * @param {import('./LoyaltyCard.entity').LoyaltyCard} card
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard>}
   */
  async save(card) { throw new Error('Not implemented'); }

  /**
   * @param {import('./LoyaltyCard.entity').LoyaltyCard} card
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard>}
   */
  async update(card) { throw new Error('Not implemented'); }

  /**
   * @param {string} userId
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard>}
   */
  async addVisit(userId) { throw new Error('Not implemented'); }

  /**
   * @param {string} userId
   * @returns {Promise<import('./LoyaltyCard.entity').LoyaltyCard>}
   */
  async resetCard(userId) { throw new Error('Not implemented'); }
}
