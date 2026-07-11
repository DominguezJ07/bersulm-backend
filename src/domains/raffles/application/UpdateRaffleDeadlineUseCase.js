import { RaffleNotFound, RaffleNotInVotingPhase } from '../domain/RaffleErrors.js';
import { ForbiddenError, ValidationError } from '../../../shared/domain/DomainError.js';

export class UpdateRaffleDeadlineUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {Object} user
   * @param {'client' | 'admin'} user.role
   * @param {string} raffleId
   * @param {number} durationMinutes
   * @returns {Promise<import('../domain/Raffle.entity').Raffle>}
   */
  async execute(user, raffleId, durationMinutes) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    if (!durationMinutes || durationMinutes <= 0) {
      throw new ValidationError('durationMinutes must be a positive number');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (raffle.status !== 'voting') {
      throw new RaffleNotInVotingPhase();
    }

    const newRaffleDate = new Date(Date.now() + durationMinutes * 60 * 1000);
    return await this.raffleRepository.updateById(raffleId, { raffleDate: newRaffleDate });
  }
}
