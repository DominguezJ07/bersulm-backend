import { ValidationError } from '../../../shared/domain/DomainError.js';

export class CreateMonthlyRaffleUseCase {
  /**
   * @param {import('../domain/IRaffleRepository').IRaffleRepository} raffleRepository
   */
  constructor(raffleRepository) {
    this.raffleRepository = raffleRepository;
  }

  /**
   * @param {{ month: string, status?: string, raffleDate: string }} params
   * @returns {Promise<Object>}
   */
  async execute({ month, status, raffleDate }) {
    if (!month || !raffleDate) {
      throw new ValidationError('month and raffleDate are required');
    }

    const validStatuses = ['voting', 'active', 'completed'];
    if (status && !validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const raffleData = {
      month,
      status: status || 'voting',
      raffleDate: new Date(raffleDate),
      participants: [],
      manualParticipants: [],
      createdAt: new Date()
    };

    return await this.raffleRepository.create(raffleData);
  }
}
