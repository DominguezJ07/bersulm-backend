import { RaffleNotFound, RaffleNotInActivePhase, ParticipantNotFound } from '../domain/RaffleErrors.js';
import { ForbiddenError } from '../../../shared/domain/DomainError.js';

export class RemoveManualParticipantUseCase {
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
   * @param {string} participantId
   * @returns {Promise<import('../domain/Raffle.entity').Raffle>}
   */
  async execute(user, raffleId, participantId) {
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

    const exists = (raffle.manualParticipants || []).some((mp) => mp._id === participantId);
    if (!exists) {
      throw new ParticipantNotFound();
    }

    return await this.raffleRepository.removeManualParticipant(raffleId, participantId);
  }
}
