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
}
