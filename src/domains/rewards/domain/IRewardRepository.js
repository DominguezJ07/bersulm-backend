/**
 * @interface IRewardRepository
 */
export class IRewardRepository {
  /**
   * @returns {Promise<import('./Reward.entity').Reward[]>}
   */
  async findAll() { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<import('./Reward.entity').Reward | null>}
   */
  async findById(id) { throw new Error('Not implemented'); }

  /**
   * @param {import('./Reward.entity').Reward} reward
   * @returns {Promise<import('./Reward.entity').Reward>}
   */
  async save(reward) { throw new Error('Not implemented'); }

  /**
   * @param {import('./Reward.entity').Reward} reward
   * @returns {Promise<import('./Reward.entity').Reward>}
   */
  async update(reward) { throw new Error('Not implemented'); }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) { throw new Error('Not implemented'); }
}
