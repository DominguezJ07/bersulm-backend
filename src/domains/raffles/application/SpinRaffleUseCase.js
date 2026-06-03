import { RaffleNotFound } from '../domain/RaffleErrors.js';
import { ForbiddenError } from '../../../shared/domain/DomainError.js';

export class SpinRaffleUseCase {
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
   * @returns {Promise<import('../domain/Raffle.entity').Raffle>}
   */
  async execute(user, raffleId) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (!raffle.participants || raffle.participants.length === 0) {
      raffle.status = 'completed';
      raffle.winnerId = null;
      return await this.raffleRepository.update(raffle);
    }

    const randomIndex = Math.floor(Math.random() * raffle.participants.length);
    const winnerId = raffle.participants[randomIndex];

    raffle.winnerId = winnerId;
    raffle.status = 'completed';

    return await this.raffleRepository.update(raffle);
  }
}
