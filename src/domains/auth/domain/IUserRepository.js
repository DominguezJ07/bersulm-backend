/**
 * @interface IUserRepository
 */
export class IUserRepository {
  /**
   * @param {string} email
   * @returns {Promise<import('./User.entity').User | null>}
   */
  async findByEmail(email) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<import('./User.entity').User | null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {import('./User.entity').User} user
   * @returns {Promise<import('./User.entity').User>}
   */
  async save(user) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {import('./User.entity').User} user
   * @returns {Promise<import('./User.entity').User>}
   */
  async update(user) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} query
   * @param {number} [limit]
   * @returns {Promise<import('./User.entity').User[]>}
   */
  async search(query, limit) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} userId
   * @param {string} fcmToken
   * @returns {Promise<import('./User.entity').User>}
   */
  async addFcmToken(userId, fcmToken) {
    throw new Error('Method not implemented');
  }
}
