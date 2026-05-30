import { ServiceNotFound } from '../domain/ServiceErrors.js';

export class UpdateServiceUseCase {
  /**
   * @param {import('../domain/IServiceRepository').IServiceRepository} serviceRepository
   */
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  /**
   * @param {string} id
   * @param {Partial<import('../domain/Service.entity').ServiceProps>} updateData
   * @returns {Promise<import('../domain/Service.entity').Service>}
   */
  async execute(id, updateData) {
    const service = await this.serviceRepository.findById(id);
    if (!service) {
      throw new ServiceNotFound();
    }

    Object.assign(service, updateData);
    service.updatedAt = new Date();

    return await this.serviceRepository.update(service);
  }
}
