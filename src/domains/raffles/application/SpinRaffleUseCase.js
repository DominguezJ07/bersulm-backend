import { randomInt } from 'node:crypto';
import { RaffleNotFound, RaffleNotYetFinished } from '../domain/RaffleErrors.js';
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

    const raffle = await this.raffleRepository.findByIdWithParticipants(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (raffle.status !== 'completed' && new Date(raffle.raffleDate).getTime() > Date.now()) {
      throw new RaffleNotYetFinished();
    }

    const pool = await this.raffleRepository.getParticipantPool(raffleId);

    if (pool.length === 0) {
      raffle.status = 'completed';
      raffle.winnerId = null;
      return await this.raffleRepository.update(raffle);
    }

    const randomIndex = randomInt(pool.length);
    const winner = pool[randomIndex];

    raffle.winnerId = winner.userId || null;
    raffle.status = 'completed';

    return await this.raffleRepository.update(raffle);
  }
}
