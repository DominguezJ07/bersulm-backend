/**
 * @interface IServiceRepository
 */
export class IServiceRepository {
  /**
   * @returns {Promise<import('./Service.entity').Service[]>}
   */
  async findAll() {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<import('./Service.entity').Service | null>}
   */
  async findById(id) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} category
   * @returns {Promise<import('./Service.entity').Service[]>}
   */
  async findByCategory(category) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {import('./Service.entity').Service} service
   * @returns {Promise<import('./Service.entity').Service>}
   */
  async save(service) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {import('./Service.entity').Service} service
   * @returns {Promise<import('./Service.entity').Service>}
   */
  async update(service) {
    throw new Error('Method not implemented');
  }

  /**
   * @param {string} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    throw new Error('Method not implemented');
  }
}
