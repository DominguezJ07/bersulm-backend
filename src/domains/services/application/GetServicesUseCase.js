export class GetServicesUseCase {
  /**
   * @param {import('../domain/IServiceRepository').IServiceRepository} serviceRepository
   */
  constructor(serviceRepository) {
    this.serviceRepository = serviceRepository;
  }

  /**
   * @returns {Promise<import('../domain/Service.entity').Service[]>}
   */
  async execute() {
    const services = await this.serviceRepository.findAll();
    return services
      .filter(service => service.isActive)
      .sort((a, b) => a.order - b.order);
  }
}
