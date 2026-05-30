import { LoyaltyCard } from '../domain/LoyaltyCard.entity.js';

export class GetLoyaltyCardUseCase {
  /**
   * @param {import('../domain/ILoyaltyRepository').ILoyaltyRepository} loyaltyRepository
   */
  constructor(loyaltyRepository) {
    this.loyaltyRepository = loyaltyRepository;
  }

  /**
   * @param {string} userId
   * @returns {Promise<import('../domain/LoyaltyCard.entity').LoyaltyCard>}
   */
  async execute(userId) {
    let card = await this.loyaltyRepository.findByUserId(userId);
    if (!card) {
      card = LoyaltyCard.create({ userId, visits: 0, totalVisits: 0, status: 'active', currentCycle: 1 });
      card = await this.loyaltyRepository.save(card);
    }
    return card;
  }
}
