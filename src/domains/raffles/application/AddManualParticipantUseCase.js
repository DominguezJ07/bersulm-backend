import { RaffleNotFound, RaffleNotInActivePhase, ParticipantAlreadyExists } from '../domain/RaffleErrors.js';
import { ForbiddenError } from '../../../shared/domain/DomainError.js';

export class AddManualParticipantUseCase {
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
   * @param {{ name: string, userId?: string }} participant
   * @returns {Promise<import('../domain/Raffle.entity').Raffle>}
   */
  async execute(user, raffleId, { name, userId = null }) {
    if (!user || user.role !== 'admin') {
      throw new ForbiddenError('Admin privileges required');
    }

    const raffle = await this.raffleRepository.findById(raffleId);
    if (!raffle) {
      throw new RaffleNotFound();
    }

    if (raffle.status !== 'active') {
      throw new RaffleNotInActivePhase();
    }

    const existing = (raffle.manualParticipants || []).find((mp) => mp.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      throw new ParticipantAlreadyExists(name);
    }

    return await this.raffleRepository.addManualParticipant(raffleId, { name, userId });
  }
}
