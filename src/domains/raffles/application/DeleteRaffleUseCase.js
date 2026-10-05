import { ForbiddenError } from '../../../shared/domain/DomainError.js';
import { RaffleNotFound } from '../domain/RaffleErrors.js';

export class DeleteRaffleUseCase {
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  async execute(user, raffleId) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }
    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }
    await this.raffleRepository.deleteById(raffleId);
    return { success: true };
  }
}
