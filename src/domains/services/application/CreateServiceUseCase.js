import { Service } from '../domain/Service.entity.js';

export class CreateServiceUseCase {
  /**
   * @param {import('../domain/IServiceRepository').IServiceRepository} serviceRepository
   */
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  /**
   * @param {Object} serviceData
   * @param {string} serviceData.name
   * @param {string} serviceData.description
   * @param {number} serviceData.price
   * @param {number} serviceData.durationMin
   * @param {string} serviceData.icon
   * @param {'corte' | 'barba' | 'color' | 'extra'} serviceData.category
   * @param {number} [serviceData.order]
   * @returns {Promise<Service>}
   */
  async execute(serviceData) {
    const service = Service.create(serviceData);
    return await this.serviceRepository.save(service);
  }
}
