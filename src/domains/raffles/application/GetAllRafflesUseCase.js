import { ForbiddenError } from '../../../shared/domain/DomainError.js';

export class GetAllRafflesUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute(user, { page = 1, limit = 20 } = {}) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }
    const skip = (page - 1) * limit;
    const { raffles, total } = await this.raffleRepository.findAll({ skip, limit });
    return { raffles, total, page, totalPages: Math.ceil(total / limit) };
  }
}
